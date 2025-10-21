import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  plannedStart: string;
  plannedEnd: string;
  plannedCost: string;
  priority: string;
  contractorId: string;
}

const emptyWork: WorkForm = {
  id: '',
  title: '',
  description: '',
  volume: '',
  unit: '',
  plannedStart: '',
  plannedEnd: '',
  plannedCost: '',
  priority: 'medium',
  contractorId: '',
};

export default function ManageWorks() {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [works, setWorks] = useState<WorkForm[]>([{ ...emptyWork, id: crypto.randomUUID() }]);

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

  const handleSave = () => {
    const invalidWorks = works.filter(w => !w.title.trim());
    if (invalidWorks.length > 0) {
      toast({
        title: 'Ошибка валидации',
        description: 'Укажите название для всех работ',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Работы сохранены',
      description: `Добавлено работ: ${works.length}`,
    });

    setTimeout(() => {
      navigate(`/objects/${objectId}`);
    }, 1000);
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

        <div className="space-y-4">
          {works.map((work, index) => (
            <Card key={work.id} className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
              
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Работа {index + 1}</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateWork(work.id)}
                      title="Дублировать"
                    >
                      <Icon name="Copy" size={18} />
                    </Button>
                    <Button
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
                    <Label htmlFor={`plannedStart-${work.id}`}>Плановое начало</Label>
                    <Input
                      id={`plannedStart-${work.id}`}
                      type="date"
                      value={work.plannedStart}
                      onChange={(e) => updateWork(work.id, 'plannedStart', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`plannedEnd-${work.id}`}>Плановое окончание</Label>
                    <Input
                      id={`plannedEnd-${work.id}`}
                      type="date"
                      value={work.plannedEnd}
                      onChange={(e) => updateWork(work.id, 'plannedEnd', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`plannedCost-${work.id}`}>Плановая стоимость (руб.)</Label>
                    <Input
                      id={`plannedCost-${work.id}`}
                      type="number"
                      placeholder="0"
                      value={work.plannedCost}
                      onChange={(e) => updateWork(work.id, 'plannedCost', e.target.value)}
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
                      value={work.contractorId}
                      onValueChange={(value) => updateWork(work.id, 'contractorId', value)}
                    >
                      <SelectTrigger id={`contractor-${work.id}`}>
                        <SelectValue placeholder="Без подрядчика" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ООО Строй Подряд</SelectItem>
                        <SelectItem value="2">АО ВентСистемы</SelectItem>
                        <SelectItem value="3">ИП Иванов А.А.</SelectItem>
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
            variant="outline"
            onClick={addWork}
            className="w-full md:w-auto"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить работу
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full md:w-auto"
          >
            Отмена
          </Button>
          
          <Button
            onClick={handleSave}
            className="w-full md:w-auto"
          >
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить все работы ({works.length})
          </Button>
        </div>

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
}
