import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useToast } from '@/hooks/use-toast';
import { Defect } from '@/components/inspection/DefectsSection';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/store/hooks';
import { updateInspection } from '@/store/slices/inspectionsSlice';

export function useInspectionActions(
  inspection: any,
  defects: Defect[],
  setDefects: (defects: Defect[]) => void,
  setDefectReport: (report: any) => void
) {
  const navigate = useNavigate();
  const { userData, user, loadUserData } = useAuthRedux();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleBack = () => {
    sessionStorage.removeItem('inspectionFromPage');
    navigate(-1);
  };

  const handleCompleteInspection = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await dispatch(updateInspection({
        id: inspection.id,
        data: {
          status: 'completed',
          defects: JSON.stringify(defects),
          completed_at: new Date().toISOString()
        }
      })).unwrap();
      
      await loadUserData();
      
      toast({ title: 'Проверка завершена' });
      handleBack();
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось завершить проверку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      await dispatch(updateInspection({
        id: inspection.id,
        data: {
          defects: JSON.stringify(defects)
        }
      })).unwrap();
      
      await loadUserData();
      
      toast({ title: 'Изменения сохранены' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось сохранить',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await dispatch(updateInspection({
        id: inspection.id,
        data: {
          status: 'active',
          defects: JSON.stringify(defects)
        }
      })).unwrap();
      
      await loadUserData();
      
      toast({ title: 'Проверка начата' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось начать проверку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefect = (newDefect: Defect, newDefectPhotos: string[]) => {
    if (!newDefect.description.trim()) {
      toast({ title: 'Заполните описание замечания', variant: 'destructive' });
      return false;
    }

    const defect: Defect = {
      ...newDefect,
      id: Date.now().toString(),
      photo_urls: newDefectPhotos.length > 0 ? newDefectPhotos : undefined
    };

    setDefects([...defects, defect]);
    toast({ title: 'Замечание добавлено' });
    return true;
  };

  const handleRemoveDefect = (id: string) => {
    setDefects(defects.filter(d => d.id !== id));
  };

  const handleCreateDefectReport = async () => {
    if (!user?.id || defects.length === 0 || !inspection?.id) {
      return;
    }
    
    // Проверка: акт уже создан
    if (inspection.defect_report_document_id) {
      toast({ 
        title: 'Акт уже создан', 
        description: 'Для этой проверки уже сформирован акт об обнаружении дефектов',
        variant: 'destructive'
      });
      return;
    }
    
    setLoadingReport(true);
    try {
      // 1. Получить шаблон "Акт об обнаружении дефектов" по system_key
      const templatesResponse = await apiClient.get(ENDPOINTS.DOCUMENTS.TEMPLATES);
      const templates = templatesResponse.data?.templates || [];
      console.log('📋 Available templates:', templates.map((t: any) => ({ id: t.id, name: t.name, system_key: t.system_key })));
      const defectTemplate = templates.find((t: any) => t.system_key === 'defect_detection_act');
      console.log('✅ Found defect template:', defectTemplate);
      
      if (!defectTemplate) {
        throw new Error('Шаблон "Акт об обнаружении дефектов" не найден');
      }
      
      // 2. Получить данные работы и объекта
      let work: any = null;
      let object: any = null;
      
      // Ищем работу во всех объектах
      for (const obj of userData?.objects || []) {
        const foundWork = obj.works?.find((w: any) => w.id === inspection.work_id);
        if (foundWork) {
          work = foundWork;
          object = obj;
          break;
        }
      }
      
      if (!work || !object) {
        throw new Error('Работа или объект не найдены');
      }
      
      // Генерируем номер акта
      const reportNumber = `АКТ-${work.id}-${inspection.id}-${Date.now()}`;
      
      // 3. Подготовить данные для документа
      const documentData = {
        work_id: inspection.work_id,
        templateId: defectTemplate.id,
        title: `Акт об обнаружении дефектов №${reportNumber}`,
        status: 'draft',
        contentData: {
          title: `АКТ ОБ ОБНАРУЖЕНИИ ДЕФЕКТОВ №${reportNumber}`,
          date: new Date().toLocaleDateString('ru-RU'),
          objectName: object?.title || 'Не указан',
          objectAddress: object?.address || '',
          workName: work?.title || 'Не указана',
          inspectionNumber: inspection.inspection_number || '',
          defects: defects,
          totalDefects: defects.length,
          criticalDefects: defects.filter((d: any) => d.severity === 'critical').length,
          reportNumber: reportNumber
        },
        htmlContent: ''
      };
      
      // 4. Создать документ
      const docResponse = await apiClient.post(ENDPOINTS.DOCUMENTS.CREATE, documentData);
      
      if (!docResponse.success) {
        throw new Error(docResponse.error || 'Не удалось создать документ');
      }
      
      // 5. Сохранить ссылку на документ в проверке
      await dispatch(updateInspection({
        id: inspection.id,
        data: {
          defect_report_document_id: docResponse.data.id
        }
      })).unwrap();
      
      await loadUserData();
      
      setDefectReport({
        id: docResponse.data.id,
        report_number: reportNumber,
        total_defects: defects.length,
        critical_defects: defects.filter((d: any) => d.severity === 'critical').length,
        created_at: docResponse.data.createdAt || new Date().toISOString()
      });
      
      const documentId = docResponse.data.id;
      toast({ 
        title: 'Акт создан!', 
        description: `Акт №${reportNumber} сохранён`,
        onClick: () => navigate(ROUTES.DOCUMENT_VIEW(documentId))
      });
      
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({ 
        title: 'Ошибка', 
        description: error.message || 'Не удалось сформировать акт',
        variant: 'destructive'
      });
    } finally {
      setLoadingReport(false);
    }
  };

  return {
    loading,
    loadingReport,
    handleBack,
    handleCompleteInspection,
    handleSaveDraft,
    handleStartInspection,
    handleAddDefect,
    handleRemoveDefect,
    handleCreateDefectReport
  };
}