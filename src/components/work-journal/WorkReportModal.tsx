import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Material {
  name: string;
  quantity: number;
  unit: string;
}

interface WorkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    text_content: string;
    work_volume: string;
    materials: Material[];
    photo_urls: string[];
    completion_percentage: number;
  }) => void;
  isSubmitting?: boolean;
  currentCompletion?: number;
}

export default function WorkReportModal({ isOpen, onClose, onSubmit, isSubmitting, currentCompletion = 0 }: WorkReportModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [workVolume, setWorkVolume] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(currentCompletion);
  const [showCompletionWarning, setShowCompletionWarning] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([{ name: '', quantity: 0, unit: '' }]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const handleAddMaterial = () => {
    setMaterials([...materials, { name: '', quantity: 0, unit: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, field: keyof Material, value: string | number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const handleSubmit = () => {
    if (completionPercentage === 100 && !showCompletionWarning) {
      setShowCompletionWarning(true);
      return;
    }

    const validMaterials = materials.filter(m => m.name.trim() !== '');
    
    onSubmit({
      text_content: description,
      work_volume: workVolume,
      materials: validMaterials,
      photo_urls: photoUrls,
      completion_percentage: completionPercentage,
    });

    setDescription('');
    setWorkVolume('');
    setCompletionPercentage(0);
    setMaterials([{ name: '', quantity: 0, unit: '' }]);
    setPhotoUrls([]);
    setShowCompletionWarning(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    const placeholderUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: `Файл ${file.name} не является изображением`,
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: `Файл ${file.name} слишком большой (максимум 10 МБ)`,
          variant: 'destructive',
        });
        continue;
      }

      const randomId = Math.floor(Math.random() * 1000);
      placeholderUrls.push(`https://picsum.photos/seed/${randomId}/800/600`);
    }

    setTimeout(() => {
      setPhotoUrls([...photoUrls, ...placeholderUrls]);
      setUploadingPhotos(false);
      
      toast({
        title: 'Фото добавлены',
        description: `Добавлено фото: ${placeholderUrls.length} (демо-режим)`,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 800);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setDescription('');
    setWorkVolume('');
    setCompletionPercentage(currentCompletion);
    setMaterials([{ name: '', quantity: 0, unit: '' }]);
    setPhotoUrls([]);
    setShowCompletionWarning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle>Отчёт о работе</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="description">Описание выполненных работ</Label>
            <Textarea
              id="description"
              placeholder="Опишите что было сделано..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="volume">Объём работ</Label>
            <Input
              id="volume"
              placeholder="Например: 50 м², 100 шт, 20 кг"
              value={workVolume}
              onChange={(e) => setWorkVolume(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="completion">Процент выполнения работ</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                id="completion"
                type="range"
                min="0"
                max="100"
                step="5"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center gap-1 min-w-[70px]">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={completionPercentage}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value)));
                    setCompletionPercentage(val);
                  }}
                  className="w-16 text-center"
                />
                <span className="text-sm font-semibold text-slate-600">%</span>
              </div>
            </div>
            {completionPercentage === 100 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  При отправке отчета с 100% выполнения Заказчик получит уведомление о готовности к приемке работ
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Материалы</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMaterial}
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </div>

            <div className="space-y-3">
              {materials.map((material, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Название"
                    value={material.name}
                    onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Кол-во"
                    value={material.quantity || ''}
                    onChange={(e) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Input
                    placeholder="Ед."
                    value={material.unit}
                    onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                    className="w-20"
                  />
                  {materials.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMaterial(index)}
                      className="flex-shrink-0"
                    >
                      <Icon name="X" size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Фотографии</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div 
              className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingPhotos ? (
                <>
                  <Icon name="Loader2" size={32} className="mx-auto text-blue-600 mb-2 animate-spin" />
                  <p className="text-sm text-slate-600 mb-1">Загрузка...</p>
                </>
              ) : (
                <>
                  <Icon name="Camera" size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Нажмите для добавления фото</p>
                  <p className="text-xs text-slate-400">(до/после работ, до 10 МБ каждое)</p>
                </>
              )}
            </div>
            {photoUrls.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-600 font-medium">Добавлено фото: {photoUrls.length}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {showCompletionWarning && (
            <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg mb-2">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Подтверждение готовности к приемке
                  </p>
                  <p className="text-xs text-blue-800 mb-3">
                    Вы указали 100% выполнения. После отправки отчета Заказчик получит уведомление 
                    о готовности работ к приемке. Уверены что работы полностью завершены?
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline" 
                      onClick={() => setShowCompletionWarning(false)}
                    >
                      Изменить процент
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="Check" size={16} className="mr-1" />
                      Да, отправить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!showCompletionWarning && (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Отмена
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!description.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}