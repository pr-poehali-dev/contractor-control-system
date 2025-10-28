import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch } from '@/store/hooks';
import { updateObject } from '@/store/slices/objectsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';

const EditObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loadUserData, userData } = useAuthRedux();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const object = objects.find(s => s.id === Number(objectId));

  useEffect(() => {
    if (object) {
      setFormData({
        title: object.title || '',
        address: object.address || '',
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [object]);

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

    if (!user || !objectId) return;

    setIsSubmitting(true);

    try {
      await dispatch(updateObject({
        id: Number(objectId),
        data: {
          title: formData.title,
          address: formData.address,
        },
      })).unwrap();

      await loadUserData();

      toast({
        title: 'Объект обновлён!',
        description: `Изменения успешно сохранены`,
      });

      setTimeout(() => {
        navigate(ROUTES.OBJECT_DETAIL(Number(objectId)));
      }, 300);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить объект',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.OBJECTS)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Объект не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24 md:pb-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(ROUTES.OBJECT_DETAIL(Number(objectId)))}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        Назад
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Редактирование объекта</h1>
        <p className="text-slate-600">Измените название и адрес объекта</p>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Полный адрес</Label>
                  <Input
                    id="address"
                    placeholder="г. Казань, ул. Ленина, д. 10"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
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
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={20} className="mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => navigate(ROUTES.OBJECT_DETAIL(Number(objectId)))}
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
                  <Icon name="Info" className="text-blue-600" size={18} />
                  Редактирование объекта
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p className="text-xs">
                  Вы можете изменить название и адрес объекта. Все работы и данные останутся без изменений.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default EditObject;