import React, { RefObject, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { DefectCard } from './DefectCard';

export interface Defect {
  id: string;
  description: string;
  location?: string;
  severity?: string;
  responsible?: string;
  deadline?: string;
  photo_urls?: string[];
}

interface DefectsSectionProps {
  defects: Defect[];
  newDefect: Defect;
  newDefectPhotos: string[];
  uploadingPhotos: boolean;
  isDraft: boolean;
  isClient: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onDefectChange: (field: keyof Defect, value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (url: string) => void;
  onAddDefect: () => void;
  onRemoveDefect: (id: string) => void;
}

export default function DefectsSectionNew({
  defects,
  newDefect,
  newDefectPhotos,
  uploadingPhotos,
  isDraft,
  isClient,
  fileInputRef,
  onDefectChange,
  onFileSelect,
  onRemovePhoto,
  onAddDefect,
  onRemoveDefect
}: DefectsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    if (newDefect.description && !showForm) {
      setShowForm(true);
    }
  }, [newDefect.description, showForm]);

  const handleAddDefect = () => {
    onAddDefect();
    setShowForm(false);
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Замечания</h2>
      </div>

      {isDraft && isClient && showForm && (
        <div className="mb-4 p-4 md:p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 space-y-3">
          <div>
            <Label htmlFor="description" className="text-xs md:text-sm mb-1 block">
              Описание нарушения <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={newDefect.description}
              onChange={(e) => onDefectChange('description', e.target.value)}
              placeholder="Опишите выявленное нарушение"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-xs md:text-sm mb-1 block">
              Местоположение
            </Label>
            <Input
              id="location"
              value={newDefect.location || ''}
              onChange={(e) => onDefectChange('location', e.target.value)}
              placeholder="Например: 2 этаж, комната 205"
              className="text-sm h-9 md:h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="severity" className="text-xs md:text-sm mb-1 block">
                Критичность
              </Label>
              <Select value={newDefect.severity || ''} onValueChange={(val) => onDefectChange('severity', val)}>
                <SelectTrigger className="text-sm h-9 md:h-10">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкая</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="high">Высокая</SelectItem>
                  <SelectItem value="critical">Критическая</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-xs md:text-sm mb-1 block">
                Срок устранения
              </Label>
              <Input
                id="deadline"
                type="date"
                value={newDefect.deadline || ''}
                onChange={(e) => onDefectChange('deadline', e.target.value)}
                className="text-sm h-9 md:h-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsible" className="text-xs md:text-sm mb-1 block">
              Ответственный за устранение
            </Label>
            <Input
              id="responsible"
              value={newDefect.responsible || ''}
              onChange={(e) => onDefectChange('responsible', e.target.value)}
              placeholder="ФИО или название организации"
              className="text-sm h-9 md:h-10"
            />
          </div>

          <div>
            <Label className="text-xs md:text-sm mb-1 block">
              Фотофиксация
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhotos}
              className="w-full"
            >
              <Icon name="Camera" size={16} className="mr-2" />
              {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
            </Button>
          </div>

          {newDefectPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newDefectPhotos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-white shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={() => onRemovePhoto(url)}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                onDefectChange('description', '');
              }} 
              className="flex-1"
            >
              Отмена
            </Button>
            <Button 
              type="button"
              onClick={handleAddDefect}
              disabled={!newDefect.description}
              className="flex-1"
            >
              Добавить замечание
            </Button>
          </div>
        </div>
      )}

      {defects.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed mb-4">
          <Icon name="AlertCircle" size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 mb-4">Замечаний пока нет</p>
          {isDraft && isClient && (
            <Button type="button" onClick={() => setShowForm(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить замечание
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {defects.map((defect, index) => (
              <DefectCard
                key={defect.id}
                defect={defect}
                index={index}
                isDraft={isDraft}
                isClient={isClient}
                onRemove={onRemoveDefect}
              />
            ))}
          </div>

          {isDraft && isClient && !showForm && (
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowForm(true)}
              className="w-full border-dashed"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить замечание
            </Button>
          )}
        </>
      )}
    </div>
  );
}
