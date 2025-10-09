import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import WorksList from '@/components/work-journal/WorksList';
import WorkHeader from '@/components/work-journal/WorkHeader';
import InfoTab from '@/components/work-journal/InfoTab';
import DescriptionTab from '@/components/work-journal/DescriptionTab';
import EstimateTab from '@/components/work-journal/EstimateTab';
import AnalyticsTab from '@/components/work-journal/AnalyticsTab';
import CreateInspectionModal from '@/components/work-journal/CreateInspectionModal';
import WorkReportModal from '@/components/work-journal/WorkReportModal';
import WorkEditDialog from '@/components/work-detail/WorkEditDialog';
import JournalTabContent from '@/components/work-journal/JournalTabContent';
import { NoWorksEmptyState, NoWorkSelectedEmptyState } from '@/components/work-journal/WorkJournalEmptyStates';
import { useWorkJournalHandlers } from '@/components/work-journal/useWorkJournalHandlers';
import type { JournalEvent, UserRole } from '@/types/journal';

interface WorkJournalProps {
  objectId: number;
  selectedWorkId?: number;
}

export default function WorkJournal({ objectId, selectedWorkId }: WorkJournalProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const works = (userData?.works || []).filter(w => w.object_id === objectId);
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];
  
  const currentSite = sites.find(s => s.id === objectId);
  const currentProject = currentSite ? projects.find(p => p.id === currentSite.project_id) : null;

  const selectedWork = selectedWorkId || works[0]?.id || null;
  
  const handlers = useWorkJournalHandlers(selectedWork);

  const [showWorksList, setShowWorksList] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  const handleWorkSelect = (workId: number) => {
    if (projectId) {
      navigate(`/projects/${projectId}/objects/${objectId}/works/${workId}`);
    }
  };

  const handleCreateEstimate = () => {
    toast({ title: 'Создание сметы', description: 'Функция в разработке' });
  };

  if (works.length === 0) {
    return <NoWorksEmptyState objectId={objectId} />;
  }

  if (!selectedWork) {
    return <NoWorkSelectedEmptyState />;
  }

  const userRole: UserRole = user?.role || 'contractor';
  const contractors = userData?.contractors || [];

  const selectedWorkData = works.find(w => w.id === selectedWork);
  const workEntries = workLogs
    .filter(log => log.work_id === selectedWork)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const mockEvents: JournalEvent[] = workEntries.map(log => ({
    id: log.id,
    type: 'work_entry' as const,
    work_id: log.work_id,
    created_by: log.created_by,
    author_name: log.author_name,
    author_role: (log.author_role || 'contractor') as UserRole,
    created_at: log.created_at,
    content: log.description,
    work_data: {
      volume: log.volume,
      unit: log.unit,
      materials: log.materials ? log.materials.split(',').map(m => m.trim()) : [],
      photos: log.photo_urls ? log.photo_urls.split(',') : [],
      progress: log.progress,
    },
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white overflow-hidden border-t border-slate-200">
      <div className="md:hidden border-b border-slate-200 p-3">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setShowWorksList(!showWorksList)}
        >
          <span className="truncate">{selectedWorkData?.title || 'Выберите работу'}</span>
          <Icon name={showWorksList ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>

        {showWorksList && (
          <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg">
            {works.map((work) => (
              <button
                key={work.id}
                onClick={() => {
                  handleWorkSelect(work.id);
                  setShowWorksList(false);
                }}
                className={cn(
                  'w-full text-left p-3 border-b last:border-b-0',
                  selectedWork === work.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                )}
              >
                <div className="font-medium text-sm">{work.title}</div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Готово' : 'Ожидание'}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WorksList
          works={works}
          workLogs={workLogs}
          selectedWork={selectedWork}
          setSelectedWork={handleWorkSelect}
          getInitials={getInitials}
          formatTime={formatTime}
          objectId={objectId}
        />

        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedWorkData ? (
            <>
              <WorkHeader
                selectedWorkData={selectedWorkData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                organizationName={currentProject?.client_name}
                userRole={userRole}
                onEdit={() => handlers.handleEditClick(selectedWorkData)}
              />

              <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'journal' && (
                  <JournalTabContent
                    mockEvents={mockEvents}
                    userId={user?.id}
                    userRole={userRole}
                    newMessage={handlers.newMessage}
                    setNewMessage={handlers.setNewMessage}
                    isSubmitting={handlers.isSubmitting}
                    handleSendMessage={handlers.handleSendMessage}
                    handleCreateInspectionClick={handlers.handleCreateInspectionClick}
                    setIsWorkReportModalOpen={handlers.setIsWorkReportModalOpen}
                    setIsInspectionModalOpen={handlers.setIsInspectionModalOpen}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getInitials={getInitials}
                  />
                )}

                {activeTab === 'info' && (
                  <InfoTab
                    selectedWorkData={selectedWorkData}
                    workEntries={workEntries}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    handleCreateInspection={() => handlers.setIsInspectionModalOpen(true)}
                  />
                )}

                {activeTab === 'description' && (
                  <DescriptionTab selectedWorkData={selectedWorkData} />
                )}

                {activeTab === 'estimate' && (
                  <EstimateTab handleCreateEstimate={handleCreateEstimate} />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab workId={selectedWork || 0} />
                )}
              </div>

              <CreateInspectionModal
                isOpen={handlers.isInspectionModalOpen}
                onClose={() => {
                  handlers.setIsInspectionModalOpen(false);
                  handlers.setSelectedEntryForInspection(undefined);
                }}
                onSubmit={handlers.handleInspectionSubmit}
                journalEntryId={handlers.selectedEntryForInspection}
                workType={selectedWorkData?.title}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <Icon name="MessageSquare" size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-sm">Выберите работу для просмотра журнала</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <WorkReportModal
        isOpen={handlers.isWorkReportModalOpen}
        onClose={() => handlers.setIsWorkReportModalOpen(false)}
        onSubmit={handlers.handleWorkReportSubmit}
        isSubmitting={handlers.isSubmitting}
      />

      <WorkEditDialog
        isOpen={handlers.isEditDialogOpen}
        onClose={() => handlers.setIsEditDialogOpen(false)}
        onSubmit={() => handlers.handleEditSubmit(selectedWorkData)}
        formData={handlers.editFormData}
        setFormData={handlers.setEditFormData}
        contractors={contractors}
        isSubmitting={handlers.isSubmitting}
      />
    </div>
  );
}