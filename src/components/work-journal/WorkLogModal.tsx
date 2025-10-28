import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  workLog: {
    id: number;
    workLogNumber?: string;
    title?: string;
    description: string;
    workTitle?: string;
    objectTitle?: string;
    author?: string;
    timestamp: string;
    photoUrls?: string[];
    volume?: string;
    materials?: string;
  };
}

export default function WorkLogModal({ isOpen, onClose, workLog }: WorkLogModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = workLog.photoUrls || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name="FileText" size={24} className="text-blue-600" />
            <div>
              {workLog.workLogNumber && (
                <p className="text-sm text-slate-600 font-normal">
                  Отчёт <span className="font-mono font-medium text-blue-600">№{workLog.workLogNumber}</span>
                </p>
              )}
              <p className="text-lg font-semibold">{workLog.workTitle}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {workLog.objectTitle && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-50">
                <Icon name="Building2" size={14} className="mr-1" />
                {workLog.objectTitle}
              </Badge>
              {workLog.author && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Icon name="User" size={14} className="mr-1" />
                  {workLog.author}
                </Badge>
              )}
            </div>
          )}

          <div className="text-sm text-slate-600">
            <Icon name="Calendar" size={14} className="inline mr-1" />
            {format(new Date(workLog.timestamp), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </div>

          {workLog.description && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{workLog.description}</p>
            </div>
          )}

          {(workLog.volume || workLog.materials) && (
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg">
              {workLog.volume && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Package" size={16} className="text-slate-500" />
                  <span className="font-medium">Объём:</span>
                  <span className="text-slate-700">{workLog.volume}</span>
                </div>
              )}
              {workLog.materials && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Boxes" size={16} className="text-slate-500" />
                  <span className="font-medium">Материалы:</span>
                  <span className="text-slate-700">{workLog.materials}</span>
                </div>
              )}
            </div>
          )}

          {photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Фотографии ({photos.length})</h4>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={photos[currentImageIndex]}
                    alt={`Фото ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {photos.length > 1 && (
                    <>
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                        {currentImageIndex + 1} / {photos.length}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
                        onClick={handlePrevImage}
                      >
                        <Icon name="ChevronLeft" size={20} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
                        onClick={handleNextImage}
                      >
                        <Icon name="ChevronRight" size={20} />
                      </Button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
