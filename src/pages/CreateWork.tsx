import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const CreateWork = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUserData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    volume: '',
    unit: '',
    start_date: '',
    end_date: '',
    estimated_cost: '',
    contractor_id: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !objectId) return;

    setIsSubmitting(true);

    try {
      const result = await api.createItem(user.id, 'work', {
        object_id: Number(objectId),
        title: formData.title,
        description: formData.description,
        status: 'active',
      });

      const newWorkId = result.data.id;
      
      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Работа создана!',
        description: `Работа "${formData.title}" успешно добавлена`,
      });

      setTimeout(() => {
        navigate(`/projects/${projectId}/objects/${objectId}/works/${newWorkId}`);
      }, 300);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать работу',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К объекту
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Создание работы</h1>
        <p className="text-slate-600">Укажите вид работ для данного объекта</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о работе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название работы *</Label>
                <Input
                  id="title"
                  placeholder="Например: Замена кровли"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                  data-tour="work-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание работ</Label>
                <Textarea
                  id="description"
                  placeholder="Подробное описание работ..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Объём работ</Label>
                  <Input
                    id="volume"
                    type="number"
                    placeholder="0"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Единица измерения</Label>
                  <Input
                    id="unit"
                    placeholder="м², м³, шт..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Плановое начало</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Плановое окончание</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Плановая стоимость (руб.)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    placeholder="0"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Приоритет</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row gap-3 lg:col-span-2">
          <Button 
            type="submit" 
            size="lg" 
            className="md:min-w-[200px]"
            disabled={isSubmitting}
            data-tour="create-work-submit"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Создать работу
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Lightbulb" className="text-blue-600" size={18} />
                Советы по заполнению
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📑 Описание</p>
                <p className="text-xs">Укажите ссылки на нормативы и требования к выполнению</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📅 Сроки</p>
                <p className="text-xs">Учитывайте время на согласования и проверки</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">🔥 Приоритет</p>
                <p className="text-xs">Высокий приоритет - для критичных работ на критическом пути</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Info" className="text-green-600" size={18} />
                Что дальше?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              <div className="flex gap-2">
                <span className="font-bold text-green-600">1.</span>
                <p>Назначьте подрядчика на работу</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">2.</span>
                <p>Создайте первую запись в журнале работ</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">3.</span>
                <p>Отслеживайте прогресс и вносите замечания</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateWork;