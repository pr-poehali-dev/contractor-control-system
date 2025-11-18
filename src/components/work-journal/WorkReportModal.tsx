import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { EstimatePosition, WorkReportPosition } from '@/types/estimate';

interface WorkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    photo_urls: string[];
    positions: Omit<WorkReportPosition, 'id' | 'report_id'>[];
  }) => void;
  isSubmitting?: boolean;
  estimatePositions: EstimatePosition[];
}

interface PositionForm {
  tempId: string;
  estimate_position_id?: number;
  name: string;
  unit: string;
  actual_quantity: number;
  is_manual: boolean;
}

export default function WorkReportModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  estimatePositions 
}: WorkReportModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [positions, setPositions] = useState<PositionForm[]>([]);

  const handleAddPosition = () => {
    setPositions([
      ...positions,
      {
        tempId: `temp-${Date.now()}`,
        name: '',
        unit: '',
        actual_quantity: 0,
        is_manual: false,
      }
    ]);
  };

  const handleRemovePosition = (tempId: string) => {
    setPositions(positions.filter(p => p.tempId !== tempId));
  };

  const handlePositionSelectChange = (tempId: string, positionId: string) => {
    if (positionId === 'manual') {
      setPositions(positions.map(p =>
        p.tempId === tempId
          ? { ...p, estimate_position_id: undefined, name: '', unit: '', is_manual: true }
          : p
      ));
      return;
    }

    const selectedPosition = estimatePositions.find(ep => ep.id === Number(positionId));
    if (selectedPosition) {
      setPositions(positions.map(p =>
        p.tempId === tempId
          ? {
              ...p,
              estimate_position_id: selectedPosition.id,
              name: selectedPosition.name,
              unit: selectedPosition.unit,
              is_manual: false,
            }
          : p
      ));
    }
  };

  const handleManualToggle = (tempId: string, checked: boolean) => {
    setPositions(positions.map(p =>
      p.tempId === tempId
        ? {
            ...p,
            is_manual: checked,
            estimate_position_id: checked ? undefined : p.estimate_position_id,
            name: checked ? '' : p.name,
            unit: checked ? '' : p.unit,
          }
        : p
    ));
  };

  const handlePositionFieldChange = (tempId: string, field: keyof PositionForm, value: string | number) => {
    setPositions(positions.map(p =>
      p.tempId === tempId ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = () => {
    if (positions.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну позицию в отчет',
        variant: 'destructive',
      });
      return;
    }

    const invalidPositions = positions.filter(p => 
      !p.name.trim() || !p.unit.trim() || p.actual_quantity <= 0
    );

    if (invalidPositions.length > 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля позиций и укажите корректное количество',
        variant: 'destructive',
      });
      return;
    }

    const reportPositions: Omit<WorkReportPosition, 'id' | 'report_id'>[] = positions.map(p => ({
      estimate_position_id: p.estimate_position_id,
      name: p.name,
      unit: p.unit,
      actual_quantity: p.actual_quantity,
      is_manual: p.is_manual,
    }));
    
    onSubmit({
      description,
      photo_urls: photoUrls,
      positions: reportPositions,
    });
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

      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const fileName = encodeURIComponent(file.name);
      placeholderUrls.push(`https://placehold.co/800x600/${randomColor}/white?text=${fileName}`);
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
    setPositions([]);
    setPhotoUrls([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
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
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Позиции сметы</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPosition}
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить позицию
              </Button>
            </div>

            {positions.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                <Icon name="ListChecks" size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Добавьте позиции из сметы для отчета</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={position.tempId} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700">Позиция {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePosition(position.tempId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>

                    {!position.is_manual ? (
                      <>
                        <div>
                          <Label htmlFor={`position-${position.tempId}`} className="text-xs">
                            Выберите позицию из сметы
                          </Label>
                          <Select
                            value={position.estimate_position_id?.toString() || ''}
                            onValueChange={(value) => handlePositionSelectChange(position.tempId, value)}
                          >
                            <SelectTrigger id={`position-${position.tempId}`} className="mt-1">
                              <SelectValue placeholder="Выберите позицию..." />
                            </SelectTrigger>
                            <SelectContent>
                              {estimatePositions.map(ep => (
                                <SelectItem key={ep.id} value={ep.id.toString()}>
                                  {ep.name} ({ep.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`manual-${position.tempId}`}
                            checked={position.is_manual}
                            onCheckedChange={(checked) => handleManualToggle(position.tempId, checked as boolean)}
                          />
                          <Label htmlFor={`manual-${position.tempId}`} className="text-xs text-slate-600 cursor-pointer">
                            Добавить позицию вручную (нет в смете)
                          </Label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox
                            id={`manual-${position.tempId}`}
                            checked={position.is_manual}
                            onCheckedChange={(checked) => handleManualToggle(position.tempId, checked as boolean)}
                          />
                          <Label htmlFor={`manual-${position.tempId}`} className="text-xs text-blue-600 font-medium cursor-pointer">
                            ✓ Ручной ввод
                          </Label>
                        </div>
                        
                        <div>
                          <Label htmlFor={`name-${position.tempId}`} className="text-xs">
                            Наименование
                          </Label>
                          <Input
                            id={`name-${position.tempId}`}
                            placeholder="Например: Радиаторы 6 секций"
                            value={position.name}
                            onChange={(e) => handlePositionFieldChange(position.tempId, 'name', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`unit-${position.tempId}`} className="text-xs">
                            Единица измерения
                          </Label>
                          <Input
                            id={`unit-${position.tempId}`}
                            placeholder="шт, м², м³, кг"
                            value={position.unit}
                            onChange={(e) => handlePositionFieldChange(position.tempId, 'unit', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor={`quantity-${position.tempId}`} className="text-xs">
                        Фактически выполнено
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id={`quantity-${position.tempId}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={position.actual_quantity || ''}
                          onChange={(e) => handlePositionFieldChange(position.tempId, 'actual_quantity', Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm text-slate-600 min-w-[40px]">{position.unit || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Фотографии</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} className="mr-1" />
                    Добавить
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || positions.length === 0}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить отчет
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
