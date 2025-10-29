import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/apiClient';
import { InspectionInfoCard } from '@/components/inspection/InspectionInfoCard';
import DefectsSectionNew, { Defect } from '@/components/inspection/DefectsSectionNew';
import InspectionActions from '@/components/inspection/InspectionActions';
import DefectReportCard from '@/components/inspection/DefectReportCard';
import ScheduledInspectionNotice from '@/components/inspection/ScheduledInspectionNotice';
import InspectionHintsCard from '@/components/inspection/InspectionHintsCard';
import { useInspectionData } from '@/hooks/useInspectionData';
import { useInspectionActions } from '@/hooks/useInspectionActions';
import { useDefectPhotos } from '@/hooks/useDefectPhotos';

const InspectionDetail = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { userData, user } = useAuthRedux();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { inspection, defects, setDefects, defectReport, setDefectReport } = useInspectionData(inspectionId);
  
  const {
    loading,
    loadingReport,
    handleBack,
    handleCompleteInspection,
    handleSaveDraft,
    handleStartInspection,
    handleAddDefect,
    handleRemoveDefect,
    handleCreateDefectReport
  } = useInspectionActions(inspection, defects, setDefects, setDefectReport);

  const {
    newDefectPhotos,
    uploadingPhotos,
    handleFileSelect,
    handleRemovePhoto,
    resetPhotos
  } = useDefectPhotos();

  interface DraftDefect extends Defect {
    tempId: string;
    photos: string[];
  }

  const [draftDefects, setDraftDefects] = useState<DraftDefect[]>([]);
  const defectsRef = useRef<HTMLDivElement>(null);

  const handleAddDraft = () => {
    const newDraft: DraftDefect = {
      id: '',
      tempId: Date.now().toString(),
      description: '',
      location: '',
      severity: '',
      responsible: '',
      deadline: '',
      photos: []
    };
    setDraftDefects(prev => [...prev, newDraft]);
  };

  const handleDraftChange = (tempId: string, field: keyof Defect, value: string) => {
    setDraftDefects(prev => prev.map(draft => 
      draft.tempId === tempId ? { ...draft, [field]: value } : draft
    ));
  };

  const handleDraftPhotoAdd = (tempId: string, photos: string[]) => {
    setDraftDefects(prev => prev.map(draft => 
      draft.tempId === tempId ? { ...draft, photos: [...draft.photos, ...photos] } : draft
    ));
  };

  const handleDraftPhotoRemove = (tempId: string, photoUrl: string) => {
    setDraftDefects(prev => prev.map(draft => 
      draft.tempId === tempId ? { ...draft, photos: draft.photos.filter(p => p !== photoUrl) } : draft
    ));
  };

  const handleRemoveDraft = (tempId: string) => {
    setDraftDefects(prev => prev.filter(draft => draft.tempId !== tempId));
  };

  const handleSaveDefects = () => {
    draftDefects.forEach(draft => {
      if (draft.description) {
        handleAddDefect(draft, draft.photos);
      }
    });
    setDraftDefects([]);
  };

  const [remediating, setRemediating] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleRemediate = async (defectId: string) => {
    if (!inspection || !user) return;

    setRemediating(prev => ({ ...prev, [defectId]: true }));

    try {
      const response = await apiClient.post('/ef8edfd4-ef48-48a9-95fb-78f5a4982949', {
        inspection_id: inspection.id,
        defect_id: defectId,
        status: 'completed',
        description: 'Замечание устранено подрядчиком'
      });

      if (response.success) {
        toast({
          title: 'Успешно',
          description: 'Заявление об устранении отправлено'
        });
      } else {
        throw new Error(response.error || 'Ошибка отправки');
      }
    } catch (error: any) {
      console.error('[InspectionDetail] Remediate error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить заявление',
        variant: 'destructive'
      });
    } finally {
      setRemediating(prev => ({ ...prev, [defectId]: false }));
    }
  };

  if (!inspection) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <p className="text-slate-500 text-center mt-8">Проверка не найдена</p>
        </div>
      </div>
    );
  }

  const work = userData?.works?.find((w: any) => w.id === inspection.work_id);
  const object = userData?.objects?.find((o: any) => o.id === work?.object_id);
  
  const isClient = user?.role === 'client';
  
  const isScheduledForToday = () => {
    if (!inspection.scheduled_date) return false;
    
    const scheduledDate = new Date(inspection.scheduled_date);
    if (isNaN(scheduledDate.getTime())) return false;
    
    const year = scheduledDate.getFullYear();
    if (year < 1900 || year > 2100) return false;
    
    const today = new Date();
    scheduledDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return scheduledDate.getTime() === today.getTime();
  };

  const canEdit = inspection.status === 'draft' || 
                  (inspection.status === 'active' && isClient) ||
                  (inspection.type === 'scheduled' && isScheduledForToday());

  const workInspections = userData?.inspections?.filter((i: any) => i.work_id === inspection.work_id) || [];
  const inspectionIndex = workInspections.findIndex((i: any) => i.id === inspection.id) + 1;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleBack}
              className="flex-shrink-0 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={20} className="text-slate-600" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold flex-1 min-w-0 truncate">
              Проверка №{inspection.inspection_number || inspectionIndex}
            </h1>
          </div>
        </div>

        <InspectionInfoCard
          status={inspection.status}
          workTitle={work?.title}
          objectTitle={object?.title}
        />

        {!canEdit && inspection.type === 'scheduled' && !isScheduledForToday() && (
          <ScheduledInspectionNotice scheduledDate={inspection.scheduled_date} />
        )}

        {canEdit && <InspectionHintsCard />}

        <div ref={defectsRef}>
          <DefectsSectionNew
            defects={defects}
            draftDefects={draftDefects}
            isDraft={canEdit}
            isClient={isClient}
            isCompleted={inspection.status === 'completed'}
            onAddDraft={handleAddDraft}
            onDraftChange={handleDraftChange}
            onDraftPhotoAdd={handleDraftPhotoAdd}
            onDraftPhotoRemove={handleDraftPhotoRemove}
            onRemoveDraft={handleRemoveDraft}
            onSaveDefects={handleSaveDefects}
            onRemoveDefect={handleRemoveDefect}
            onRemediate={handleRemediate}
          />
        </div>



        {inspection.status === 'completed' && defects.length > 0 && (
          <DefectReportCard
            defectReport={defectReport}
            loadingReport={loadingReport}
            onCreateReport={handleCreateDefectReport}
            isClient={isClient}
          />
        )}

        <InspectionActions
          canEdit={canEdit}
          isClient={isClient}
          inspectionStatus={inspection.status}
          inspectionType={inspection.type}
          loading={loading}
          onSaveDraft={handleSaveDraft}
          onStartInspection={handleStartInspection}
          onCompleteInspection={handleCompleteInspection}
        />
      </div>
    </div>
  );
};

export default InspectionDetail;