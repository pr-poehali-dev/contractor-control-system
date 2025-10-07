import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateObject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    floors: '',
    apartments: '',
    buildYear: '',
    area: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Объект создан',
      description: `Объект "${formData.address}" добавлен в проект`,
    });
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К проекту
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Добавление объекта</h1>
        <p className="text-slate-600">Капремонт Казани 2025</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация об объекте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес *</Label>
                  <Input
                    id="address"
                    placeholder="Например: ул. Ленина, д. 10"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Дополнительная информация об объекте..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floors">Этажность</Label>
                    <Input
                      id="floors"
                      type="number"
                      placeholder="5"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartments">Количество квартир</Label>
                    <Input
                      id="apartments"
                      type="number"
                      placeholder="60"
                      value={formData.apartments}
                      onChange={(e) => setFormData({ ...formData, apartments: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildYear">Год постройки</Label>
                    <Input
                      id="buildYear"
                      type="number"
                      placeholder="1985"
                      value={formData.buildYear}
                      onChange={(e) => setFormData({ ...formData, buildYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Общая площадь (м²)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="3500"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Следующие шаги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">После создания объекта добавьте виды работ</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Назначьте подрядчиков на каждую работу</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="text-blue-600 mt-0.5" size={16} />
                  <p className="text-slate-700">Загрузите проектную документацию</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="submit" size="lg" className="min-w-[200px]">
            <Icon name="Save" size={20} className="mr-2" />
            Создать объект
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateObject;
