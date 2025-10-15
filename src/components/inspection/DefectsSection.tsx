import React, { RefObject, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

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

const COMMON_DEFECTS = [
  'Отклонение от проектной документации',
  'Некачественное выполнение работ',
  'Использование материалов несоответствующего качества',
  'Нарушение технологии производства работ',
  'Дефекты поверхности (трещины, сколы, неровности)',
  'Нарушение геометрических размеров',
  'Некачественная гидроизоляция',
  'Дефекты окраски и отделки',
  'Нарушение правил техники безопасности',
  'Загрязнение строительной площадки'
];

export default function DefectsSection({
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
  const [showCommonDefects, setShowCommonDefects] = useState(false);

  React.useEffect(() => {
    if (newDefect.description && !showForm) {
      setShowForm(true);
    }
  }, [newDefect.description, showForm]);

  const handleAddDefect = () => {
    onAddDefect();
    setShowForm(false);
    setShowCommonDefects(false);
  };

  const handleSelectCommonDefect = (defect: string) => {
    onDefectChange('description', defect);
    setShowCommonDefects(false);
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
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 space-y-4">
          
          {!showCommonDefects ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommonDefects(true)}
              className="w-full border-dashed"
            >
              <Icon name="List" size={16} className="mr-2" />
              Выбрать типовое нарушение
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-slate-600">Типовые нарушения</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommonDefects(false)}
                  className="h-6 text-xs"
                >
                  Свернуть
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {COMMON_DEFECTS.map((defect, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCommonDefect(defect)}
                    className="text-left text-sm p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {defect}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description" className="text-xs text-slate-600 mb-1.5 block">
              Описание нарушения *
            </Label>
            <Textarea
              id="description"
              value={newDefect.description}
              onChange={(e) => onDefectChange('description', e.target.value)}
              placeholder="Опишите выявленное нарушение"
              rows={3}
              className="text-sm resize-none border-slate-300 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-xs text-slate-600 mb-1.5 block">
              Местоположение
            </Label>
            <Input
              id="location"
              value={newDefect.location || ''}
              onChange={(e) => onDefectChange('location', e.target.value)}
              placeholder="Например: 2 этаж, комната 205"
              className="text-sm border-slate-300 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="severity" className="text-xs text-slate-600 mb-1.5 block">
                Критичность
              </Label>
              <Select value={newDefect.severity || ''} onValueChange={(val) => onDefectChange('severity', val)}>
                <SelectTrigger className="text-sm border-slate-300">
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
              <Label htmlFor="deadline" className="text-xs text-slate-600 mb-1.5 block">
                Срок устранения
              </Label>
              <Input
                id="deadline"
                type="date"
                value={newDefect.deadline || ''}
                onChange={(e) => onDefectChange('deadline', e.target.value)}
                className="text-sm border-slate-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsible" className="text-xs text-slate-600 mb-1.5 block">
              Ответственный за устранение
            </Label>
            <Input
              id="responsible"
              value={newDefect.responsible || ''}
              onChange={(e) => onDefectChange('responsible', e.target.value)}
              placeholder="ФИО или название организации"
              className="text-sm border-slate-300 focus:border-blue-500"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
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
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhotos}
              className="w-full border-slate-300"
            >
              <Icon name="Camera" size={16} className="mr-2" />
              {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
            </Button>
          </div>

          {newDefectPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
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

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForm(false);
                setShowCommonDefects(false);
                onDefectChange('description', '');
              }} 
              className="flex-1"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAddDefect}
              disabled={!newDefect.description}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Добавить замечание
            </Button>
          </div>
        </div>
      )}

      {defects.length > 0 ? (
        <div className="space-y-3">
          {defects.map((defect, index) => {
            const getSeverityBadge = (severity?: string) => {
              switch (severity) {
                case 'critical':
                  return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">Критическая</span>;
                case 'high':
                  return <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">Высокая</span>;
                case 'medium':
                  return <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Средняя</span>;
                case 'low':
                  return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Низкая</span>;
                default:
                  return null;
              }
            };

            return (
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
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  {getSeverityBadge(defect.severity)}
                </div>

                <p className="text-slate-800 pr-8 mb-3 leading-relaxed font-medium">{defect.description}</p>
                
                {defect.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Icon name="MapPin" size={14} className="text-slate-400" />
                    <span>{defect.location}</span>
                  </div>
                )}

                {defect.responsible && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Icon name="User" size={14} className="text-slate-400" />
                    <span>{defect.responsible}</span>
                  </div>
                )}

                {defect.deadline && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Icon name="Clock" size={14} className="text-slate-400" />
                    <span>Устранить до: {new Date(defect.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                
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
            );
          })}
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
