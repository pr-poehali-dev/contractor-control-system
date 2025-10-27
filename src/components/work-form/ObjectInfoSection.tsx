import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ObjectData {
  id: number | null;
  name: string;
  address: string;
  customer: string;
  description: string;
  photo_url?: string;
}

interface ObjectInfoSectionProps {
  objectData: ObjectData;
  updateObjectField: (field: keyof ObjectData, value: string) => void;
  saveObject: () => void;
  isSubmitting: boolean;
}

export const ObjectInfoSection = ({
  objectData,
  updateObjectField,
  saveObject,
  isSubmitting,
}: ObjectInfoSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10 МБ');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://cdn.poehali.dev/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка загрузки');

      const data = await response.json();
      updateObjectField('photo_url' as keyof ObjectData, data.url);
      toast.success('Фото объекта загружено');
    } catch (error) {
      toast.error('Не удалось загрузить изображение');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 text-left hover:opacity-70 transition-opacity"
        >
          <Icon 
            name={isExpanded ? "ChevronDown" : "ChevronRight"} 
            size={20} 
            className="text-slate-500 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Icon name="Building2" size={18} />
              Информация об объекте
            </h3>
            {!isExpanded && (
              <p className="text-sm text-slate-500 mt-1">
                {objectData.address || 'Адрес не указан'} • {objectData.customer || 'Заказчик не указан'}
              </p>
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t pl-8">
            <div className="md:col-span-2">
              <Label htmlFor="object-name" className="text-sm">
                Название объекта
              </Label>
              <Input
                id="object-name"
                value={objectData.name}
                onChange={(e) => updateObjectField('name', e.target.value)}
                placeholder="Введите название объекта"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="object-address" className="text-sm">
                Адрес
              </Label>
              <Input
                id="object-address"
                value={objectData.address}
                onChange={(e) => updateObjectField('address', e.target.value)}
                placeholder="г. Москва. Ул. Пушкина, д. 5"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="object-customer" className="text-sm">
                Заказчик
              </Label>
              <Input
                id="object-customer"
                value={objectData.customer}
                onChange={(e) => updateObjectField('customer', e.target.value)}
                placeholder="Название заказчика"
                className="h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="object-description" className="text-sm">
                Описание
              </Label>
              <Textarea
                id="object-description"
                value={objectData.description}
                onChange={(e) => updateObjectField('description', e.target.value)}
                placeholder="Краткое описание объекта"
                className="min-h-[80px]"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm">Фотография объекта</Label>
              <div className="flex items-center gap-4 mt-2">
                {objectData.photo_url && (
                  <img 
                    src={objectData.photo_url} 
                    alt="Объект" 
                    className="h-24 w-24 object-cover rounded-lg border border-slate-200"
                  />
                )}
                <div className="flex-1">
                  <label 
                    htmlFor="photo-upload" 
                    className="inline-flex items-center justify-center h-9 px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer transition-colors text-sm font-medium"
                  >
                    <Icon name={isUploadingPhoto ? "Loader2" : "Upload"} size={16} className={`mr-2 ${isUploadingPhoto ? 'animate-spin' : ''}`} />
                    {objectData.photo_url ? 'Изменить фото' : 'Загрузить фото'}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                  <p className="text-xs text-slate-500 mt-2">Поддерживаются JPG, PNG. Максимум 10 МБ</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={saveObject}
                disabled={isSubmitting}
                size="sm"
              >
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить объект
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};