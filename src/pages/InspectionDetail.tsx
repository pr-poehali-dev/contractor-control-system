import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import InspectionHeader from '@/components/inspection/InspectionHeader';
import DefectsSection, { Defect } from '@/components/inspection/DefectsSection';
import ControlPointsSection, { ControlPoint } from '@/components/inspection/ControlPointsSection';
import CommonDefectsSection from '@/components/inspection/CommonDefectsSection';
import InspectionActions from '@/components/inspection/InspectionActions';
import DefectReportCard from '@/components/inspection/DefectReportCard';
import ScheduledInspectionNotice from '@/components/inspection/ScheduledInspectionNotice';
import { useInspectionData } from '@/hooks/useInspectionData';
import { useInspectionActions } from '@/hooks/useInspectionActions';
import { useDefectPhotos } from '@/hooks/useDefectPhotos';

const InspectionDetail = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { userData, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { inspection, defects, setDefects, controlPoints, defectReport, setDefectReport } = useInspectionData(inspectionId);
  
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

  const [newDefect, setNewDefect] = useState<Defect>({
    id: '',
    description: '',
    location: '',
    severity: '',
    responsible: '',
    deadline: ''
  });
  const [checkedPoints, setCheckedPoints] = useState<Set<string>>(new Set());
  const defectsRef = useRef<HTMLDivElement>(null);

  const handleDefectChange = (field: keyof Defect, value: string) => {
    setNewDefect(prev => ({ ...prev, [field]: value }));
  };

  const handleControlPointClick = (cp: ControlPoint) => {
    const cpId = String(cp.id);
    const newChecked = new Set(checkedPoints);
    
    if (newChecked.has(cpId)) {
      newChecked.delete(cpId);
    } else {
      newChecked.add(cpId);
      setNewDefect(prev => ({ ...prev, description: cp.description }));
      
      setTimeout(() => {
        defectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    setCheckedPoints(newChecked);
  };

  const onAddDefect = () => {
    const success = handleAddDefect(newDefect, newDefectPhotos);
    if (success) {
      setNewDefect({
        id: '',
        description: '',
        location: '',
        severity: '',
        responsible: '',
        deadline: ''
      });
      resetPhotos();
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
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">
              Проверка №{inspectionIndex}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        <InspectionHeader
          inspectionNumber={inspection.inspection_number}
          status={inspection.status}
          type={inspection.type}
          workTitle={work?.title}
          objectTitle={object?.title}
          scheduledDate={inspection.scheduled_date}
        />

        {!canEdit && inspection.type === 'scheduled' && !isScheduledForToday() && (
          <ScheduledInspectionNotice scheduledDate={inspection.scheduled_date} />
        )}

        <div ref={defectsRef}>
          <DefectsSection
            defects={defects}
            newDefect={newDefect}
            newDefectPhotos={newDefectPhotos}
            uploadingPhotos={uploadingPhotos}
            isDraft={canEdit}
            isClient={isClient}
            fileInputRef={fileInputRef}
            onDefectChange={handleDefectChange}
            onFileSelect={(e) => handleFileSelect(e, fileInputRef)}
            onRemovePhoto={handleRemovePhoto}
            onAddDefect={onAddDefect}
            onRemoveDefect={handleRemoveDefect}
          />
        </div>

        {inspection.status !== 'completed' && (
          <>
            <CommonDefectsSection
              onSelectDefect={(description) => {
                handleDefectChange('description', description);
                setTimeout(() => {
                  defectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            />

            <ControlPointsSection
              controlPoints={controlPoints}
              checkedPoints={checkedPoints}
              onControlPointClick={handleControlPointClick}
            />
          </>
        )}

        {inspection.status === 'completed' && defects.length > 0 && (
          <DefectReportCard
            defectReport={defectReport}
            loadingReport={loadingReport}
            onCreateReport={handleCreateDefectReport}
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