import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateWork = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contractor: '',
    startDate: '',
    endDate: '',
    budget: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Работа создана',
      description: `Работа "${formData.name}" добавлена к объекту`,
    });
    navigate(`/projects/${projectId}/objects/${objectId}`);
  };

  const contractors = [
    'ООО "СтройМастер"',
    'ИП Иванов А.А.',
    'ООО "Фасад-Мастер"',
    'ООО "ТеплоДом"',
    'ИП Петров С.С.',
  ];

  const categories = [
    'Кровельные работы',
    'Фасадные работы',
    'Внутренние работы',
    'Инженерные системы',
    'Благоустройство',
    'Прочие работы',
  ];

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К объекту
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Добавление работы</h1>
        <p className="text-slate-600">ул. Ленина, д. 10 • Капремонт Казани 2025</p>
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
                  <Label htmlFor="name">Название работы *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Замена кровли"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание работ</Label>
                  <Textarea
                    id="description"
                    placeholder="Подробное описание объёма и характера работ..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor">Подрядчик *</Label>
                  <Select
                    value={formData.contractor}
                    onValueChange={(value) => setFormData({ ...formData, contractor: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите подрядчика" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor} value={contractor}>
                          {contractor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="budget">Бюджет работы (₽)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="2220000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Что будет создано</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="ClipboardCheck" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Журнал строительных работ для этой работы</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="FileText" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Раздел для загрузки сметы</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Search" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Возможность создавать проверки</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="BarChart3" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Аналитика план/факт</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="submit" size="lg" className="min-w-[200px]">
            <Icon name="Save" size={20} className="mr-2" />
            Создать работу
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateWork;
