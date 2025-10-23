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
    const work = userData?.works?.find((w: any) => w.id === inspection?.work_id);
    if (work?.object_id && inspection?.work_id) {
      navigate(`/objects/${work.object_id}/works/${inspection.work_id}`);
    } else {
      navigate('/dashboard');
    }
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
      console.log('📤 Sending POST request to create report...');
      const response = await apiClient.post(ENDPOINTS.DEFECTS.REPORTS, {
        inspection_id: parseInt(inspection.id.toString()),
        notes: ''
      });
      console.log('📥 Response received:', response);
      
      if (!response.success) {
        console.error('Failed to create report:', response.error);
        throw new Error(response.error || 'Failed to create report');
      }
      
      setDefectReport(response.data);
      
      await loadUserData();
      
      toast({ 
        title: 'Акт успешно сформирован!', 
        description: `Акт №${response.data?.report_number} доступен в разделе "Документы"`
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