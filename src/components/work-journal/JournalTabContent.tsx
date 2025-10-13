import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import EventItem from '@/components/work-journal/EventItem';
import { NoJournalEntriesEmptyState } from '@/components/work-journal/WorkJournalEmptyStates';
import type { JournalEvent, UserRole } from '@/types/journal';

interface JournalTabContentProps {
  mockEvents: JournalEvent[];
  userId: number | undefined;
  userRole: UserRole;
  newMessage: string;
  setNewMessage: (value: string) => void;
  isSubmitting: boolean;
  handleSendMessage: () => void;
  handleCreateInspectionClick: (eventId: number) => void;
  setIsWorkReportModalOpen: (value: boolean) => void;
  setIsInspectionModalOpen: (value: boolean) => void;
  formatDate: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
  getInitials: (name: string) => string;
}

export default function JournalTabContent({
  mockEvents,
  userId,
  userRole,
  newMessage,
  setNewMessage,
  isSubmitting,
  handleSendMessage,
  handleCreateInspectionClick,
  setIsWorkReportModalOpen,
  setIsInspectionModalOpen,
  formatDate,
  formatTime,
  getInitials,
}: JournalTabContentProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 md:p-8 lg:p-12 bg-slate-50">
        {mockEvents.length === 0 ? (
          <NoJournalEntriesEmptyState />
        ) : (
          <div className="max-w-7xl mx-auto space-y-10">
            {mockEvents.map((event, index) => {
              const showDateSeparator = index === 0 || 
                formatDate(mockEvents[index - 1].created_at) !== formatDate(event.created_at);

              return (
                <div key={event.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                        {formatDate(event.created_at)}
                      </div>
                    </div>
                  )}

                  <EventItem
                    event={event}
                    isOwnEvent={event.created_by === userId}
                    userRole={userRole}
                    onCreateInspection={handleCreateInspectionClick}
                    formatTime={formatTime}
                    getInitials={getInitials}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-2 md:p-4 flex-shrink-0 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1.5 md:gap-2 items-end">
            <Textarea
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="resize-none flex-1 text-sm md:text-base"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex gap-1.5 md:gap-2">
              {userRole === 'contractor' ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setIsWorkReportModalOpen(true)}
                    className="h-10 hidden md:flex"
                  >
                    <Icon name="FileText" size={18} className="mr-2" />
                    Отчёт
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => setIsWorkReportModalOpen(true)}
                    className="h-10 w-10 md:hidden"
                  >
                    <Icon name="FileText" size={18} />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setIsInspectionModalOpen(true)}
                    className="h-10 hidden md:flex"
                  >
                    <Icon name="ClipboardCheck" size={18} className="mr-2" />
                    Проверка
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => setIsInspectionModalOpen(true)}
                    className="h-10 w-10 md:hidden"
                  >
                    <Icon name="ClipboardCheck" size={18} />
                  </Button>
                </>
              )}
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSubmitting}
                className="h-10 w-10 md:w-auto md:px-4"
                size="icon"
              >
                {isSubmitting ? (
                  <Icon name="Loader2" size={18} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={18} />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 hidden md:block">
            Enter — отправить, Shift+Enter — новая строка
          </p>
        </div>
      </div>
    </>
  );
}