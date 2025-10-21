import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkForm {
  id: string;
  title: string;
  description: string;
  volume: string;
  unit: string;
  planned_start_date: string;
  planned_end_date: string;
  estimated_cost: string;
  priority: string;
  contractor_id: string;
}

const emptyWork: WorkForm = {
  id: '',
  title: '',
  description: '',
  volume: '',
  unit: '',
  planned_start_date: '',
  planned_end_date: '',
  estimated_cost: '',
  priority: 'medium',
  contractor_id: '',
};

const CreateWork = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, setUserData, userData } = useAuth();
  const [works, setWorks] = useState<WorkForm[]>([{ ...emptyWork, id: crypto.randomUUID() }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractors = userData?.contractors || [];

  const addWork = () => {
    setWorks([...works, { ...emptyWork, id: crypto.randomUUID() }]);
  };

  const removeWork = (id: string) => {
    if (works.length === 1) {
      toast({
        title: 'Ошибка',
        description: 'Должна быть хотя бы одна работа',
        variant: 'destructive',
      });
      return;
    }
    setWorks(works.filter(w => w.id !== id));
  };

  const duplicateWork = (id: string) => {
    const work = works.find(w => w.id === id);
    if (work) {
      const newWork = { ...work, id: crypto.randomUUID() };
      const index = works.findIndex(w => w.id === id);
      const newWorks = [...works];
      newWorks.splice(index + 1, 0, newWork);
      setWorks(newWorks);
    }
  };

  const updateWork = (id: string, field: keyof WorkForm, value: string) => {
    setWorks(works.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidWorks = works.filter(w => !w.title.trim());
    if (invalidWorks.length > 0) {
      toast({
        title: 'Ошибка валидации',
        description: 'Укажите название для всех работ',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !objectId || !token) return;

    setIsSubmitting(true);

    try {
      const createdWorks = [];
      
      for (const work of works) {
        const result = await api.createItem(token, 'work', {
          object_id: Number(objectId),
          title: work.title,
          description: work.description,
          contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
          status: 'active',
          planned_start_date: work.planned_start_date || null,
          planned_end_date: work.planned_end_date || null,
        });
        
        createdWorks.push(result.data);
      }

      const refreshedData = await api.getUserData(token);
      setUserData(refreshedData);

      toast({
        title: 'Работы созданы!',
        description: `Добавлено работ: ${works.length}`,
      });

      setTimeout(() => {
        navigate(`/objects/${objectId}`);
      }, 500);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать работы',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/objects/${objectId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            К объекту
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Создание работ</h1>
          <p className="text-slate-600">Укажите виды работ для данного объекта</p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900">💡 Советы по заполнению</p>
              <ul className="space-y-1 text-blue-800">
                <li>📋 <strong>Описание:</strong> Укажите ссылки на нормативы и требования к выполнению</li>
                <li>📅 <strong>Сроки:</strong> Учитывайте время на согласования и проверки</li>
                <li>🔥 <strong>Приоритет:</strong> Высокий приоритет - для критических работ на критическом пути</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {works.map((work, index) => (
              <Card key={work.id} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Работа {index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateWork(work.id)}
                        title="Дублировать"
                      >
                        <Icon name="Copy" size={18} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWork(work.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`title-${work.id}`}>
                        Название работы <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`title-${work.id}`}
                        placeholder="Например: Монтаж вентиляционной системы"
                        value={work.title}
                        onChange={(e) => updateWork(work.id, 'title', e.target.value)}
                        className={cn(!work.title && 'border-red-300')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`description-${work.id}`}>Описание работ</Label>
                      <Textarea
                        id={`description-${work.id}`}
                        placeholder="Подробное описание работ..."
                        value={work.description}
                        onChange={(e) => updateWork(work.id, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`volume-${work.id}`}>Объём работ</Label>
                      <Input
                        id={`volume-${work.id}`}
                        type="number"
                        placeholder="0"
                        value={work.volume}
                        onChange={(e) => updateWork(work.id, 'volume', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`unit-${work.id}`}>Единица измерения</Label>
                      <Input
                        id={`unit-${work.id}`}
                        placeholder="м², м³, шт..."
                        value={work.unit}
                        onChange={(e) => updateWork(work.id, 'unit', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`planned_start_date-${work.id}`}>Плановое начало</Label>
                      <Input
                        id={`planned_start_date-${work.id}`}
                        type="date"
                        value={work.planned_start_date}
                        onChange={(e) => updateWork(work.id, 'planned_start_date', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`planned_end_date-${work.id}`}>Плановое окончание</Label>
                      <Input
                        id={`planned_end_date-${work.id}`}
                        type="date"
                        value={work.planned_end_date}
                        onChange={(e) => updateWork(work.id, 'planned_end_date', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`estimated_cost-${work.id}`}>Плановая стоимость (руб.)</Label>
                      <Input
                        id={`estimated_cost-${work.id}`}
                        type="number"
                        placeholder="0"
                        value={work.estimated_cost}
                        onChange={(e) => updateWork(work.id, 'estimated_cost', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`priority-${work.id}`}>Приоритет</Label>
                      <Select
                        value={work.priority}
                        onValueChange={(value) => updateWork(work.id, 'priority', value)}
                      >
                        <SelectTrigger id={`priority-${work.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`contractor-${work.id}`}>Подрядчик</Label>
                      <Select
                        value={work.contractor_id}
                        onValueChange={(value) => updateWork(work.id, 'contractor_id', value)}
                      >
                        <SelectTrigger id={`contractor-${work.id}`}>
                          <SelectValue placeholder="Без подрядчика" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractors.map((contractor: any) => (
                            <SelectItem key={contractor.id} value={String(contractor.id)}>
                              {contractor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addWork}
              className="w-full md:w-auto"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить работу
            </Button>
            
            <div className="flex-1" />
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить все работы ({works.length})
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-green-900">🚀 Что дальше?</p>
              <ol className="space-y-1 text-green-800 list-decimal list-inside">
                <li>Назначьте подрядчика на работу</li>
                <li>Создайте первую запись в журнале работ</li>
                <li>Отслеживайте прогресс и вносите замечания</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWork;
