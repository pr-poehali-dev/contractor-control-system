import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ChatTabProps {
  workEntries: any[];
  user: any;
  selectedWorkData: any;
  newMessage: string;
  setNewMessage: (value: string) => void;
  progress: string;
  setProgress: (value: string) => void;
  isSubmitting: boolean;
  handleSendMessage: () => void;
  getInitials: (name: string) => string;
  formatTime: (timestamp: string) => string;
  formatDate: (timestamp: string) => string;
}

export default function ChatTab({
  workEntries,
  user,
  selectedWorkData,
  newMessage,
  setNewMessage,
  progress,
  setProgress,
  isSubmitting,
  handleSendMessage,
  getInitials,
  formatTime,
  formatDate,
}: ChatTabProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        {workEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageSquare" size={40} className="text-blue-400" />
            </div>
            <p className="text-slate-500 text-sm mb-2">No messages in this chat yet</p>
            <p className="text-slate-400 text-xs">Start conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workEntries.map((entry, index) => {
              const isOwn = entry.created_by === user?.id;
              const showDate = index === workEntries.length - 1 || 
                formatDate(workEntries[index + 1].created_at) !== formatDate(entry.created_at);

              return (
                <div key={entry.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                  )}

                  <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={isOwn ? 'bg-blue-500 text-white text-xs' : 'bg-slate-300 text-slate-700 text-xs'}>
                        {getInitials(entry.author_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
                      <div className={cn('mb-1', isOwn && 'text-right')}>
                        <span className="text-sm font-semibold text-slate-900">{entry.author_name}</span>
                      </div>

                      <Card className={cn('border-none shadow-sm', isOwn ? 'bg-blue-50' : 'bg-white')}>
                        <CardContent className="p-3">
                          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{entry.description}</p>
                          {entry.progress !== null && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                <span>Прогресс</span>
                                <span className="font-semibold">{entry.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${entry.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className={cn('mt-2 text-xs text-slate-400', isOwn && 'text-right')}>
                            {formatTime(entry.created_at)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-3 md:p-4">
        <div className="mb-2">
          <Select value={progress} onValueChange={setProgress}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Прогресс" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0% - Не начато</SelectItem>
              <SelectItem value="25">25%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100% - Завершено</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Icon name="Paperclip" size={18} />
          </Button>
          <Textarea
            placeholder="Write message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="resize-none text-sm flex-1"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Icon name="Smile" size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Icon name="Image" size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Icon name="Video" size={18} />
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSubmitting}
            size="icon"
            className="flex-shrink-0"
          >
            {isSubmitting ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name="Send" size={18} />
            )}
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Chat participants:</span>
          <div className="flex items-center gap-1">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="bg-blue-500 text-white text-[10px]">
                {user ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            {selectedWorkData.contractor_name && (
              <Avatar className="w-5 h-5">
                <AvatarFallback className="bg-green-500 text-white text-[10px]">
                  {getInitials(selectedWorkData.contractor_name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <Button variant="link" className="text-blue-600 h-auto p-0 text-xs">
            Unsubscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
