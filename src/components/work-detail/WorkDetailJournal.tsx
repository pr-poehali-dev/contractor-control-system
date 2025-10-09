import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import EventItem from '@/components/work-journal/EventItem';
import type { JournalEvent, UserRole } from '@/types/journal';

interface WorkDetailJournalProps {
  events: JournalEvent[];
  userRole: UserRole;
  userId: number | undefined;
  onCreateInspection: (eventId: number) => void;
  onSendMessage: () => void;
  formatTime: (timestamp: string) => string;
  formatDate: (timestamp: string) => string;
  getInitials: (name: string) => string;
  newMessage: string;
  setNewMessage: (value: string) => void;
  progress: string;
  setProgress: (value: string) => void;
  volume: string;
  setVolume: (value: string) => void;
  materials: string;
  setMaterials: (value: string) => void;
  isSubmitting: boolean;
}

export default function WorkDetailJournal({
  events,
  userRole,
  userId,
  onCreateInspection,
  onSendMessage,
  formatTime,
  formatDate,
  getInitials,
  newMessage,
  setNewMessage,
  progress,
  setProgress,
  volume,
  setVolume,
  materials,
  setMaterials,
  isSubmitting,
}: WorkDetailJournalProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageSquare" size={40} className="text-blue-400" />
            </div>
            <p className="text-slate-500 text-base mb-2">Записей пока нет</p>
            <p className="text-slate-400 text-sm">Начните вести журнал работ</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-10">
            {events.map((event, index) => {
              const showDateSeparator = index === 0 || 
                formatDate(events[index - 1].created_at) !== formatDate(event.created_at);

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
                    onCreateInspection={onCreateInspection}
                    formatTime={formatTime}
                    getInitials={getInitials}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 md:p-5 lg:p-6 flex-shrink-0">
        <div className="max-w-6xl mx-auto space-y-4">
          {userRole === 'contractor' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    placeholder="Объём (м², шт, кг...)"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="text-base h-11"
                  />
                </div>
                <div>
                  <Select value={progress} onValueChange={setProgress}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Прогресс" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Input
                  placeholder="Материалы (через запятую)"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="text-base h-11"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-h-[60px] text-base resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Icon name="Paperclip" size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Icon name="Camera" size={20} />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onSendMessage}
              disabled={isSubmitting || !newMessage.trim()}
              className="flex-1"
            >
              <Icon name="Send" size={18} className="mr-2" />
              Отправить
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
