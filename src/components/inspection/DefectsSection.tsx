import React, { RefObject } from 'react';
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
  const [showForm, setShowForm] = React.useState(false);

  const handleAddDefect = () => {
    onAddDefect();
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-1.5 rounded-lg">
            <Icon name="AlertCircle" size={18} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Замечания</h3>
          {defects.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {defects.length}
            </span>
          )}
        </div>
        {isDraft && isClient && !showForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Icon name="Plus" size={16} className="mr-1" />
            Добавить
          </Button>
        )}
      </div>

      {isDraft && isClient && showForm && (
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <Textarea
            value={newDefectDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Описание замечания"
            rows={3}
            className="mb-3 text-sm resize-none border-slate-300 focus:border-blue-500"
          />
          
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
            className="w-full mb-3 border-slate-300"
          >
            <Icon name="Camera" size={16} className="mr-2" />
            {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
          </Button>

          {newDefectPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {newDefectPhotos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-white shadow-sm"
                  />
                  <Button
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

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                onDescriptionChange('');
              }} 
              className="flex-1"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAddDefect} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Добавить
            </Button>
          </div>
        </div>
      )}

      {defects.length > 0 ? (
        <div className="space-y-3">
          {defects.map((defect, index) => (
            <div key={defect.id} className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 relative shadow-sm hover:shadow-md transition-shadow">
              {isDraft && isClient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDefect(defect.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                  #{index + 1}
                </span>
              </div>
              <p className="text-slate-800 pr-8 mb-2 leading-relaxed">{defect.description}</p>
              
              {defect.photo_urls && defect.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {defect.photo_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Замечание ${index + 1} - фото ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle2" size={32} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Замечаний пока нет</p>
          </div>
        )
      )}
    </div>
  );
}