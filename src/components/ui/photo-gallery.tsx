import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
  photos: string[];
  onPhotoClick?: (index: number) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PhotoGallery({ photos, onPhotoClick, columns = 2, className = '' }: PhotoGalleryProps) {
  const gridClass = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4';
  
  const getPlaceholderColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
      'bg-gradient-to-br from-rose-400 to-rose-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`grid ${gridClass} gap-2 sm:gap-3 ${className}`}>
      {photos.map((photo, idx) => (
        <div
          key={idx}
          onClick={() => onPhotoClick?.(idx)}
          className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden cursor-pointer group"
        >
          {photo ? (
            <img
              src={photo}
              alt={`Фото ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full ${getPlaceholderColor(idx)} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Icon name="Image" size={32} className="text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      ))}
    </div>
  );
}

interface PhotoViewerProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoViewer({ photos, currentIndex, isOpen, onClose, onNavigate }: PhotoViewerProps) {
  const getPlaceholderColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-rose-400 to-rose-600',
    ];
    return colors[index % colors.length];
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={24} className="text-white" />
          </button>

          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={`Фото ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className={`w-full max-w-2xl aspect-video bg-gradient-to-br ${getPlaceholderColor(currentIndex)} rounded-lg flex items-center justify-center`}>
              <Icon name="Image" size={80} className="text-white/70" />
            </div>
          )}

          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeft" size={32} className="text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === photos.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronRight" size={32} className="text-white" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">
                  {currentIndex + 1} / {photos.length}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function usePhotoGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  const navigateToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    isOpen,
    currentIndex,
    openGallery,
    closeGallery,
    navigateToPhoto,
  };
}
