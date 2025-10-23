import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch } from '@/store/hooks';
import { createObject } from '@/store/slices/objectsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateObject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loadUserData } = useAuthRedux();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    area: '',
    floors: '',
    building_type: '',
    construction_year: '',
    responsible_person: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название объекта',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      const result = await dispatch(createObject({
        title: formData.title,
        address: formData.address,
        status: 'active',
      })).unwrap();

      await loadUserData();

      toast({
        title: 'Объект создан!',
        description: `Объект "${formData.title}" успешно добавлен`,
      });

      setTimeout(() => {
        navigate('/objects');
      }, 300);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать объект',
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
        onClick={() => navigate('/objects')}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        Назад
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Добавление объекта</h1>
        <p className="text-slate-600">Укажите адрес и название объекта строительства</p>
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
                <Label htmlFor="title">Название объекта *</Label>
                <Input
                  id="title"
                  placeholder="Например: ул. Ленина, д. 10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                  data-tour="object-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Полный адрес *</Label>
                <Input
                  id="address"
                  placeholder="г. Казань, ул. Ленина, д. 10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Площадь (м²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="0"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">Этажность</Label>
                  <Input
                    id="floors"
                    type="number"
                    placeholder="0"
                    value={formData.floors}
                    onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building_type">Тип здания</Label>
                  <Input
                    id="building_type"
                    placeholder="Жилой дом, офис..."
                    value={formData.building_type}
                    onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="construction_year">Год постройки</Label>
                  <Input
                    id="construction_year"
                    type="number"
                    placeholder="2024"
                    value={formData.construction_year}
                    onChange={(e) => setFormData({ ...formData, construction_year: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible_person">Ответственное лицо</Label>
                  <Input
                    id="responsible_person"
                    placeholder="ФИО"
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    placeholder="+7 (900) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            data-tour="create-object-submit"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Создать объект
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/objects')}
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
                <p className="font-medium text-slate-900">🏗️ Адрес</p>
                <p className="text-xs">Указывайте полный адрес с индексом для лучшей идентификации</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📏 Характеристики</p>
                <p className="text-xs">Площадь и этажность помогут в планировании работ</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📞 Контакты</p>
                <p className="text-xs">Укажите ответственного за объект для быстрой связи</p>
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
                <p>После создания добавьте виды работ на объекте</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">2.</span>
                <p>Назначьте подрядчиков на каждую работу</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">3.</span>
                <p>Начните вести журнал выполненных работ</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateObject;