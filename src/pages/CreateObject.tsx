import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CreateObject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUserData } = useAuth();
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

    if (!user || !projectId) return;

    setIsSubmitting(true);

    try {
      await api.createItem(user.id, 'object', {
        project_id: Number(projectId),
        title: formData.title,
        address: formData.address,
        status: 'active',
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Объект создан!',
        description: `Объект "${formData.title}" успешно добавлен`,
      });

      setTimeout(() => {
        navigate(`/projects/${projectId}`);
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
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К проекту
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Добавление объекта</h1>
        <p className="text-slate-600">Укажите адрес и название объекта строительства</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl space-y-6">
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

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Info" size={18} />
                Следующий шаг
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              После создания объекта добавьте работы и назначьте подрядчиков
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-8 max-w-2xl">
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
            onClick={() => navigate(`/projects/${projectId}`)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateObject;