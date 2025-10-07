import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
    address: '',
    customer: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Проект создан',
      description: `Проект "${formData.name}" успешно добавлен в систему`,
    });
    navigate('/projects');
  };

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/projects')}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К списку проектов
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Создание проекта</h1>
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
                  <Label htmlFor="name">Название проекта *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Капремонт Казани 2025"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес / Район</Label>
                  <Input
                    id="address"
                    placeholder="Например: г. Казань, Вахитовский район"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Заказчик</Label>
                  <Input
                    id="customer"
                    placeholder="Название организации-заказчика"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сроки и бюджет</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Дата начала</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Дата окончания</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Бюджет (₽)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="15000000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Параметры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Статус проекта</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Планирование</SelectItem>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="completed">Завершён</SelectItem>
                      <SelectItem value="suspended">Приостановлен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Следующие шаги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">После создания проекта добавьте объекты</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Для каждого объекта создайте работы</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Назначьте подрядчиков на работы</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="submit" size="lg" className="min-w-[200px]">
            <Icon name="Save" size={20} className="mr-2" />
            Создать проект
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/projects')}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
