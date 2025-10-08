import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const { userData, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

    setIsSubmitting(true);

    const newProject = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const updatedProjects = [...(userData?.projects || []), newProject];
    const updatedData = { ...userData, projects: updatedProjects };
    localStorage.setItem('userData', JSON.stringify(updatedData));
    refreshUserData();

    toast({
      title: 'Проект создан!',
      description: `Проект "${formData.title}" успешно добавлен`,
    });

    setTimeout(() => {
      navigate(`/projects/${newProject.id}`);
    }, 300);
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
        <div className="max-w-2xl space-y-6">
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
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Следующие шаги</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-slate-700">После создания проекта добавьте объекты</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-slate-700">Для каждого объекта создайте работы</p>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle2" className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-slate-700">Назначьте подрядчиков на работы</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-8 max-w-2xl">
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
      </form>
    </div>
  );
};

export default CreateProject;