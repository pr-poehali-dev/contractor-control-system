import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useToast } from '@/hooks/use-toast';
import { Defect } from '@/components/inspection/DefectsSection';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
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
    
    setLoadingReport(true);
    try {
      // 1. Создать defect_report
      const reportResponse = await apiClient.post(ENDPOINTS.DEFECTS.REPORTS, {
        inspection_id: parseInt(inspection.id.toString()),
        notes: ''
      });
      
      if (!reportResponse.success) {
        console.error('Failed to create report:', reportResponse.error);
        throw new Error(reportResponse.error || 'Failed to create report');
      }
      
      const defectReportData = reportResponse.data;
      setDefectReport(defectReportData);
      
      // 2. Получить шаблон "Акт об обнаружении дефектов"
      const templatesResponse = await apiClient.get(ENDPOINTS.DOCUMENTS.TEMPLATES);
      const templates = templatesResponse.data?.templates || [];
      const defectTemplate = templates.find((t: any) => 
        t.template_type === 'inspection' || 
        t.name?.includes('замечани') || 
        t.name?.includes('дефект')
      );
      
      if (defectTemplate) {
        // 3. Получить данные работы и объекта
        const work = userData?.works?.find((w: any) => w.id === inspection.work_id);
        const object = userData?.objects?.find((o: any) => o.id === work?.object_id);
        
        // 4. Подготовить данные для документа
        const documentData = {
          work_id: inspection.work_id,
          template_id: defectTemplate.id,
          document_type: 'defect_act',
          title: `Акт об обнаружении дефектов №${defectReportData.report_number}`,
          status: 'draft',
          content: {
            title: `АКТ ОБ ОБНАРУЖЕНИИ ДЕФЕКТОВ №${defectReportData.report_number}`,
            date: new Date().toLocaleDateString('ru-RU'),
            objectName: `Объект: ${object?.title || 'Не указан'}`,
            objectAddress: object?.address || '',
            workName: `Работа: ${work?.title || 'Не указана'}`,
            inspectionNumber: `Проверка №${inspection.inspection_number || ''}`,
            defects: defects.map((d: any, idx: number) => 
              `${idx + 1}. ${d.description}\n   Местоположение: ${d.location || 'не указано'}\n   Серьёзность: ${d.severity || 'не указана'}`
            ).join('\n\n'),
            totalDefects: defects.length,
            criticalDefects: defects.filter((d: any) => d.severity === 'Критический').length,
            reportNumber: defectReportData.report_number
          }
        };
        
        // 5. Создать документ
        const docResponse = await apiClient.post(ENDPOINTS.DOCUMENTS.BASE, documentData);
        
        if (docResponse.success) {
          toast({ 
            title: 'Документ создан!', 
            description: `Акт №${defectReportData.report_number} сохранён в разделе "Документы"`,
            action: {
              label: 'Открыть',
              onClick: () => navigate(`/document/${docResponse.data.id}`)
            }
          });
        }
      } else {
        toast({ 
          title: 'Отчёт создан', 
          description: `Акт №${defectReportData.report_number}. Шаблон документа не найден - создайте документ вручную.`
        });
      }
      
      await loadUserData();
      
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