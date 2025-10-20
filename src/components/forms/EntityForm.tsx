import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { createObject } from '@/store/slices/objectsSlice';
import { createWork } from '@/store/slices/worksSlice';
import { createInspection } from '@/store/slices/inspectionsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type EntityType = 'object' | 'work' | 'inspection';

interface EntityFormProps {
  type: EntityType;
  objectId?: number;
  workId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EntityForm({ type, objectId, workId, onSuccess, onCancel }: EntityFormProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, any>>({
    title: '',
    description: '',
    address: '',
    status: 'active',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'object') {
        await dispatch(createObject({
          title: formData.title,
          address: formData.address,
          description: formData.description,
        })).unwrap();
        toast({ title: 'Объект создан' });
      } else if (type === 'work' && objectId) {
        await dispatch(createWork({
          object_id: objectId,
          title: formData.title,
          description: formData.description,
          status: formData.status,
        })).unwrap();
        toast({ title: 'Работа создана' });
      } else if (type === 'inspection' && workId) {
        await dispatch(createInspection({
          work_id: workId,
          title: formData.title,
          description: formData.description,
          scheduled_date: formData.scheduled_date,
          status: 'draft',
        })).unwrap();
        toast({ title: 'Проверка создана' });
      }
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Введите название"
          required
        />
      </div>

      {type === 'object' && (
        <div>
          <Label htmlFor="address">Адрес</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Введите адрес"
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Введите описание"
          rows={4}
        />
      </div>

      {type === 'work' && (
        <div>
          <Label htmlFor="status">Статус</Label>
          <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">В работе</SelectItem>
              <SelectItem value="completed">Завершена</SelectItem>
              <SelectItem value="delayed">Задержка</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === 'inspection' && (
        <div>
          <Label htmlFor="scheduled_date">Дата проверки</Label>
          <Input
            id="scheduled_date"
            type="date"
            value={formData.scheduled_date}
            onChange={(e) => handleChange('scheduled_date', e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
