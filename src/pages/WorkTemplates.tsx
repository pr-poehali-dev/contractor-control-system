import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WorkTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  created_at: string;
}

const WorkTemplates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Общестроительные работы',
    unit: 'м²',
  });

  const categories = [
    'Общестроительные работы',
    'Отделочные работы',
    'Электромонтажные работы',
    'Сантехнические работы',
    'Кровельные работы',
    'Фасадные работы',
    'Благоустройство',
    'Прочие работы',
  ];

  const units = ['м²', 'м³', 'м.п.', 'шт', 'комплект', 'т', 'кг'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load templates:', response.status, errorText);
        throw new Error('Failed to load templates');
      }

      const data = await response.json();
      setTemplates(data.work_types || []);
    } catch (error) {
      console.error('Load templates error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить справочник работ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/b9d6731e-788e-476b-bad5-047bd3d6adc1?action=work-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('auth_token') || '',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          unit: formData.unit,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add template');
      }

      toast({
        title: 'Работа добавлена',
        description: `"${formData.name}" успешно добавлена в справочник`,
      });

      setFormData({ name: '', description: '', category: 'Общестроительные работы', unit: 'м²' });
      setIsAddOpen(false);
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить работу',
        variant: 'destructive',
      });
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter((t) => t.category === category);
    return acc;
  }, {} as Record<string, WorkTemplate[]>);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Справочник работ</h1>
        <p className="text-slate-600">Типовые виды работ для быстрого добавления в проекты</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск работ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить работу
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Добавить работу в справочник</DialogTitle>
                <DialogDescription>
                  Создайте типовой вид работ для использования в проектах
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название работы *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Кладка кирпича"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание работы..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Единица измерения</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddTemplate} className="flex-1">
                  <Icon name="Save" size={18} className="mr-2" />
                  Добавить
                </Button>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Отмена
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category}</span>
                    <Badge variant="secondary">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-900">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">{template.unit}</Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="FileX" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Работы не найдены</p>
                {isAdmin && (
                  <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить первую работу
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkTemplates;