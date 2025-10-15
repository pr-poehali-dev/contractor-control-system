import { RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

export interface Defect {
  id: string;
  description: string;
  photo_urls?: string[];
}

interface DefectsSectionProps {
  defects: Defect[];
  newDefectDescription: string;
  newDefectPhotos: string[];
  uploadingPhotos: boolean;
  isDraft: boolean;
  isClient: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onDescriptionChange: (value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (url: string) => void;
  onAddDefect: () => void;
  onRemoveDefect: (id: string) => void;
}

export default function DefectsSection({
  defects,
  newDefectDescription,
  newDefectPhotos,
  uploadingPhotos,
  isDraft,
  isClient,
  fileInputRef,
  onDescriptionChange,
  onFileSelect,
  onRemovePhoto,
  onAddDefect,
  onRemoveDefect
}: DefectsSectionProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="AlertCircle" size={20} />
            Замечания ({defects.length})
          </h3>
          {isDraft && isClient && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onDescriptionChange('')}
              className="text-sm"
            >
              Добавить замечание
            </Button>
          )}
        </div>

        {isDraft && isClient && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <Textarea
              value={newDefectDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Описание замечания"
              rows={3}
              className="mb-3 text-sm"
            />
            
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhotos}
                className="w-full mb-2"
              >
                <Icon name="Camera" size={16} className="mr-2" />
                {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
              </Button>

              {newDefectPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {newDefectPhotos.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemovePhoto(url)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={onAddDefect} size="sm" className="w-full">
              Добавить замечание
            </Button>
          </div>
        )}

        {defects.length > 0 ? (
          <div className="space-y-3">
            {defects.map((defect, index) => (
              <div key={defect.id} className="border rounded-lg p-4 bg-white relative">
                {isDraft && isClient && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDefect(defect.id)}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                )}
                <p className="font-medium text-sm text-slate-500 mb-1">#{index + 1}</p>
                <p className="text-slate-700 pr-8 mb-2">{defect.description}</p>
                
                {defect.photo_urls && defect.photo_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {defect.photo_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Замечание ${index + 1} - фото ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Замечаний нет</p>
        )}
      </CardContent>
    </Card>
  );
}
