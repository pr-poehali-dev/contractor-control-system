import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUserData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer: '',
    contractor: '',
    start_date: '',
    end_date: '',
    budget: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название проекта',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      const result = await api.createItem(user.id, 'project', {
        title: formData.title,
        description: formData.description,
        status: 'active',
      });

      const newProjectId = result.data.id;
      
      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Проект создан!',
        description: `Проект "${formData.title}" успешно добавлен`,
      });

      setTimeout(() => {
        navigate(`/projects/${newProjectId}`);
      }, 300);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать проект',
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
        onClick={() => navigate('/projects')}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К списку проектов
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Создание проекта</h1>
        <p className="text-slate-600">Заполните информацию о новом строительном проекте</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название проекта *</Label>
                <Input
                  id="title"
                  placeholder="Например: Капремонт Казани 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                  data-tour="project-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание проекта..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Заказчик</Label>
                  <Input
                    id="customer"
                    placeholder="Название организации"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor">Генподрядчик</Label>
                  <Input
                    id="contractor"
                    placeholder="Название организации"
                    value={formData.contractor}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Дата начала</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Дата окончания</Label>
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
                  <Label htmlFor="budget">Бюджет (руб.)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Адрес / Местоположение</Label>
                  <Input
                    id="location"
                    placeholder="Город, регион"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
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
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Создать проект
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/projects')}
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
                <p className="font-medium text-slate-900">📝 Название проекта</p>
                <p className="text-xs">Используйте понятное название, включающее год и регион. Например: "Капремонт школ Казани 2025"</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📅 Сроки</p>
                <p className="text-xs">Указывайте реалистичные сроки с учётом возможных задержек</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">💰 Бюджет</p>
                <p className="text-xs">Планируйте бюджет с запасом 10-15% на непредвиденные расходы</p>
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
                <p>Создайте объекты в проекте (дома, здания)</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">2.</span>
                <p>Для каждого объекта добавьте виды работ</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">3.</span>
                <p>Назначьте подрядчиков и начните вести журнал</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;