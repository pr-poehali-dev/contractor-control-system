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

export interface DraftDefect extends Defect {
  tempId: string;
  photos: string[];
}

interface DefectsSectionProps {
  defects: Defect[];
  draftDefects: DraftDefect[];
  isDraft: boolean;
  isClient: boolean;
  onAddDraft: () => void;
  onDraftChange: (tempId: string, field: keyof Defect, value: string) => void;
  onDraftPhotoAdd: (tempId: string, photos: string[]) => void;
  onDraftPhotoRemove: (tempId: string, photoUrl: string) => void;
  onRemoveDraft: (tempId: string) => void;
  onSaveDefects: () => void;
  onRemoveDefect: (id: string) => void;
}

export default function DefectsSectionNew({
  defects,
  draftDefects,
  isDraft,
  isClient,
  onAddDraft,
  onDraftChange,
  onDraftPhotoAdd,
  onDraftPhotoRemove,
  onRemoveDraft,
  onSaveDefects,
  onRemoveDefect
}: DefectsSectionProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = async (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(prev => ({ ...prev, [tempId]: true }));

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    if (uploadedUrls.length > 0) {
      onDraftPhotoAdd(tempId, uploadedUrls);
    }

    setUploadingPhotos(prev => ({ ...prev, [tempId]: false }));
    if (e.target) e.target.value = '';
  };

  const hasValidDrafts = draftDefects.some(draft => draft.description.trim());

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Замечания</h2>
      </div>

      {defects.length === 0 && draftDefects.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed mb-4">
          <Icon name="AlertCircle" size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 mb-4">Замечаний пока нет</p>
          {isDraft && isClient && (
            <Button type="button" onClick={onAddDraft}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить замечание
            </Button>
          )}
        </div>
      )}

      {defects.length > 0 && (
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
      )}

      {draftDefects.map((draft) => (
        <div key={draft.tempId} className="mb-4 p-4 md:p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-600">Новое замечание</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveDraft(draft.tempId)}
              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>

          <div>
            <Label htmlFor={`description-${draft.tempId}`} className="text-xs md:text-sm mb-1 block">
              Описание нарушения <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id={`description-${draft.tempId}`}
              value={draft.description}
              onChange={(e) => onDraftChange(draft.tempId, 'description', e.target.value)}
              placeholder="Опишите выявленное нарушение"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div>
            <Label htmlFor={`location-${draft.tempId}`} className="text-xs md:text-sm mb-1 block">
              Местоположение
            </Label>
            <Input
              id={`location-${draft.tempId}`}
              value={draft.location || ''}
              onChange={(e) => onDraftChange(draft.tempId, 'location', e.target.value)}
              placeholder="Например: 2 этаж, комната 205"
              className="text-sm h-9 md:h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`severity-${draft.tempId}`} className="text-xs md:text-sm mb-1 block">
                Критичность
              </Label>
              <Select value={draft.severity || ''} onValueChange={(val) => onDraftChange(draft.tempId, 'severity', val)}>
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
              <Label htmlFor={`deadline-${draft.tempId}`} className="text-xs md:text-sm mb-1 block">
                Срок устранения
              </Label>
              <Input
                id={`deadline-${draft.tempId}`}
                type="date"
                value={draft.deadline || ''}
                onChange={(e) => onDraftChange(draft.tempId, 'deadline', e.target.value)}
                className="text-sm h-9 md:h-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`responsible-${draft.tempId}`} className="text-xs md:text-sm mb-1 block">
              Ответственный за устранение
            </Label>
            <Input
              id={`responsible-${draft.tempId}`}
              value={draft.responsible || ''}
              onChange={(e) => onDraftChange(draft.tempId, 'responsible', e.target.value)}
              placeholder="ФИО или название организации"
              className="text-sm h-9 md:h-10"
            />
          </div>

          <div>
            <Label className="text-xs md:text-sm mb-1 block">
              Фотофиксация
            </Label>
            <input
              ref={(el) => fileInputRefs.current[draft.tempId] = el}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(draft.tempId, e)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRefs.current[draft.tempId]?.click()}
              disabled={uploadingPhotos[draft.tempId]}
              className="w-full"
            >
              <Icon name="Camera" size={16} className="mr-2" />
              {uploadingPhotos[draft.tempId] ? 'Загрузка...' : 'Добавить фото'}
            </Button>
          </div>

          {draft.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {draft.photos.map((url, idx) => (
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
                    onClick={() => onDraftPhotoRemove(draft.tempId, url)}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {isDraft && isClient && (draftDefects.length > 0 || defects.length > 0) && (
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={onAddDraft}
            className="flex-1 border-dashed"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить замечание
          </Button>
          {draftDefects.length > 0 && (
            <Button 
              type="button"
              onClick={onSaveDefects}
              disabled={!hasValidDrafts}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить ({draftDefects.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}