import { useState, useEffect } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkType {
  id: number;
  title: string;
  description?: string;
  category?: string;
  created_at: string;
}

const WorkTypes = () => {
  const { user } = useAuthRedux();
  const { toast } = useToast();
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    loadWorkTypes();
  }, []);

  const loadWorkTypes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.WORK_TYPES_CRUD);
      
      if (response.success) {
        setWorkTypes(response.data?.work_types || []);
      }
    } catch (error) {
      console.error('Failed to load work types:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить справочник работ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: WorkType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        title: type.title,
        description: type.description || '',
        category: type.category || '',
      });
    } else {
      setEditingType(null);
      setFormData({ title: '', description: '', category: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название работы обязательно',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = editingType
        ? await apiClient.put(ENDPOINTS.ADMIN.WORK_TYPES_CRUD, {
            id: editingType.id,
            ...formData,
          })
        : await apiClient.post(ENDPOINTS.ADMIN.WORK_TYPES_CRUD, formData);

      if (!response.success) throw new Error(response.error || 'Failed to save');

      toast({
        title: 'Успешно!',
        description: editingType ? 'Работа обновлена' : 'Работа добавлена',
      });

      setIsDialogOpen(false);
      loadWorkTypes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот вид работ?')) return;

    try {
      const response = await apiClient.delete(ENDPOINTS.ADMIN.WORK_TYPES_CRUD, {
        data: { id },
      });

      if (!response.success) throw new Error(response.error || 'Failed to delete');

      toast({
        title: 'Удалено',
        description: 'Вид работ удалён',
      });

      loadWorkTypes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить',
        variant: 'destructive',
      });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="ShieldAlert" size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Доступ запрещён</h2>
            <p className="text-slate-600">Только администраторы могут управлять справочниками</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Справочник работ</h1>
            <p className="text-sm md:text-base text-slate-600">Управление видами работ в системе</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingType ? 'Редактировать' : 'Добавить'} вид работ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название работы *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Монтаж кровли"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Например: Кровельные работы"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание вида работ..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="FolderOpen" size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Справочник пуст</p>
              <Button onClick={() => handleOpenDialog()}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить первый вид работ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span className="flex-1">{type.title}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(type)}
                      >
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {type.category && (
                    <Badge variant="outline" className="mb-2">
                      {type.category}
                    </Badge>
                  )}
                  {type.description && (
                    <p className="text-sm text-slate-600 line-clamp-3">{type.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkTypes;