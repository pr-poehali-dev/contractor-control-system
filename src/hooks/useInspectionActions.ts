import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Defect } from '@/components/inspection/DefectsSection';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export function useInspectionActions(
  inspection: any,
  defects: Defect[],
  setDefects: (defects: Defect[]) => void,
  setDefectReport: (report: any) => void
) {
  const navigate = useNavigate();
  const { userData, token, user, loadUserData } = useAuth();
  const { toast } = useToast();
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
    if (!token || !user?.id) return;
    
    setLoading(true);
    try {
      await api.updateItem(token, 'inspection', inspection.id, {
        status: 'completed',
        defects: JSON.stringify(defects),
        completed_at: new Date().toISOString()
      });
      
      try {
        await api.createInspectionEvent(token, {
          inspection_id: inspection.id,
          event_type: 'completed',
          created_by: user.id,
          metadata: { defects_count: defects.length }
        });
      } catch (err) {
        console.error('Failed to create event:', err);
      }
      
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
    if (!token) return;
    
    setLoading(true);
    try {
      await api.updateItem(token, 'inspection', inspection.id, {
        defects: JSON.stringify(defects)
      });
      
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
    if (!token || !user?.id) return;
    
    setLoading(true);
    try {
      await api.updateItem(token, 'inspection', inspection.id, {
        status: 'active',
        defects: JSON.stringify(defects)
      });
      
      try {
        await api.createInspectionEvent(token, {
          inspection_id: inspection.id,
          event_type: 'started',
          created_by: user.id,
          metadata: {}
        });
      } catch (err) {
        console.error('Failed to create event:', err);
      }
      
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
    console.log('🔍 handleCreateDefectReport called', {
      hasToken: !!token,
      hasUserId: !!user?.id,
      defectsCount: defects.length,
      hasInspectionId: !!inspection?.id,
      inspection,
      defects
    });
    
    if (!token || !user?.id || defects.length === 0 || !inspection?.id) {
      console.warn('❌ handleCreateDefectReport aborted:', {
        token: !!token,
        userId: user?.id,
        defectsLength: defects.length,
        inspectionId: inspection?.id
      });
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