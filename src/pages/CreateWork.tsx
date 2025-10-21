import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  workId?: number;
  title: string;
  volume: string;
  unit: string;
  planned_start_date: string;
  planned_end_date: string;
  contractor_id: string;
  isExisting: boolean;
}

const emptyWork: WorkForm = {
  id: '',
  title: '',
  volume: '',
  unit: 'м²',
  planned_start_date: '',
  planned_end_date: '',
  contractor_id: '',
  isExisting: false,
};

const UNITS = [
  'м²',
  'м³',
  'м',
  'пог.м',
  'шт',
  'кг',
  'т',
  'л',
  'компл.',
];

const CreateWork = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, setUserData, userData } = useAuth();
  const [works, setWorks] = useState<WorkForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const contractors = userData?.contractors || [];

  useEffect(() => {
    loadExistingWorks();
  }, [objectId, token]);

  const loadExistingWorks = async () => {
    if (!objectId || !token) return;

    try {
      setIsLoading(true);
      
      const freshUserData = await api.getUserData(token);
      setUserData(freshUserData);
      
      const objectWorks = freshUserData?.works?.filter((work: any) => work.object_id === Number(objectId)) || [];
      
      if (objectWorks.length > 0) {
        const existingWorks = objectWorks.map((work: any) => ({
          id: `existing-${work.id}`,
          workId: work.id,
          title: work.title || '',
          volume: '',
          unit: 'м²',
          planned_start_date: work.planned_start_date?.split('T')[0] || '',
          planned_end_date: work.planned_end_date?.split('T')[0] || '',
          contractor_id: work.contractor_id ? String(work.contractor_id) : '',
          isExisting: true,
        }));
        
        setWorks([...existingWorks, { ...emptyWork, id: crypto.randomUUID() }]);
      } else {
        setWorks([{ ...emptyWork, id: crypto.randomUUID() }]);
      }
    } catch (error) {
      console.error('Failed to load works:', error);
      setWorks([{ ...emptyWork, id: crypto.randomUUID() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addWork = () => {
    setWorks([...works, { ...emptyWork, id: crypto.randomUUID() }]);
  };

  const removeWork = (id: string) => {
    const work = works.find(w => w.id === id);
    
    if (work?.isExisting) {
      toast({
        title: 'Нельзя удалить',
        description: 'Существующие работы нельзя удалить здесь. Перейдите в карточку работы.',
        variant: 'destructive',
      });
      return;
    }

    const newWorks = works.filter(w => !w.isExisting);
    if (newWorks.length === 1) {
      toast({
        title: 'Ошибка',
        description: 'Должна быть хотя бы одна новая работа',
        variant: 'destructive',
      });
      return;
    }
    
    setWorks(works.filter(w => w.id !== id));
  };

  const duplicateWork = (id: string) => {
    const work = works.find(w => w.id === id);
    if (work) {
      const newWork = { 
        ...work, 
        id: crypto.randomUUID(), 
        isExisting: false,
        workId: undefined,
      };
      const index = works.findIndex(w => w.id === id);
      const newWorks = [...works];
      newWorks.splice(index + 1, 0, newWork);
      setWorks(newWorks);
    }
  };

  const updateWork = (id: string, field: keyof WorkForm, value: string | boolean) => {
    setWorks(works.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newWorks = works.filter(w => !w.isExisting);
    const existingWorks = works.filter(w => w.isExisting);

    const invalidWorks = newWorks.filter(w => !w.title.trim());
    if (invalidWorks.length > 0) {
      toast({
        title: 'Ошибка валидации',
        description: 'Укажите название для всех новых работ',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !objectId || !token) return;

    setIsSubmitting(true);

    try {
      for (const work of newWorks) {
        await api.createItem(token, 'work', {
          object_id: Number(objectId),
          title: work.title,
          contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
          status: 'active',
          planned_start_date: work.planned_start_date || null,
          planned_end_date: work.planned_end_date || null,
        });
      }

      for (const work of existingWorks) {
        if (work.workId) {
          await api.updateItem(token, 'work', work.workId, {
            title: work.title,
            contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
            planned_start_date: work.planned_start_date || null,
            planned_end_date: work.planned_end_date || null,
          });
        }
      }

      const refreshedData = await api.getUserData(token);
      setUserData(refreshedData);

      toast({
        title: 'Работы сохранены!',
        description: `Добавлено новых работ: ${newWorks.length}, обновлено: ${existingWorks.length}`,
      });

      setTimeout(() => {
        navigate(`/objects/${objectId}`);
      }, 500);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить работы',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/objects/${objectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Загрузка работ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            К объекту
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Управление работами</h1>
          <p className="text-slate-600">Добавьте новые работы или отредактируйте существующие</p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900">💡 Советы по заполнению</p>
              <ul className="space-y-1 text-blue-800">
                <li>📋 <strong>Объём:</strong> Укажите количество работ для контроля выполнения</li>
                <li>📅 <strong>Сроки:</strong> Учитывайте время на согласования и проверки</li>
                <li>👷 <strong>Подрядчик:</strong> Можно назначить сразу или позже</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {works.map((work, index) => (
              <Card key={work.id} className={cn("relative", work.isExisting && "bg-slate-50")}>
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                  work.isExisting ? "bg-slate-400" : "bg-blue-500"
                )} />
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">Работа {index + 1}</h3>
                      {work.isExisting && (
                        <Badge variant="outline" className="text-xs bg-slate-100">
                          Добавленная
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => duplicateWork(work.id)}
                        title="Дублировать"
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                      {!work.isExisting && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeWork(work.id)}
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label htmlFor={`title-${work.id}`} className="text-sm">
                        Название работы <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`title-${work.id}`}
                        placeholder="Например: Монтаж вентиляционной системы"
                        value={work.title}
                        onChange={(e) => updateWork(work.id, 'title', e.target.value)}
                        className={cn(!work.title && !work.isExisting && 'border-red-300', "h-9")}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`volume-${work.id}`} className="text-sm">Объём работ</Label>
                      <Input
                        id={`volume-${work.id}`}
                        type="number"
                        placeholder="0"
                        value={work.volume}
                        onChange={(e) => updateWork(work.id, 'volume', e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`unit-${work.id}`} className="text-sm">Единица измерения</Label>
                      <Select
                        value={work.unit}
                        onValueChange={(value) => updateWork(work.id, 'unit', value)}
                      >
                        <SelectTrigger id={`unit-${work.id}`} className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`planned_start_date-${work.id}`} className="text-sm">Плановое начало</Label>
                      <Input
                        id={`planned_start_date-${work.id}`}
                        type="date"
                        value={work.planned_start_date}
                        onChange={(e) => updateWork(work.id, 'planned_start_date', e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`planned_end_date-${work.id}`} className="text-sm">Плановое окончание</Label>
                      <Input
                        id={`planned_end_date-${work.id}`}
                        type="date"
                        value={work.planned_end_date}
                        onChange={(e) => updateWork(work.id, 'planned_end_date', e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`contractor-${work.id}`} className="text-sm">Подрядчик</Label>
                      <Select
                        value={work.contractor_id}
                        onValueChange={(value) => updateWork(work.id, 'contractor_id', value)}
                      >
                        <SelectTrigger id={`contractor-${work.id}`} className="h-9">
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
                  Сохранить ({works.filter(w => !w.isExisting).length} новых)
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