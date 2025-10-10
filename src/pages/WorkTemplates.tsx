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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WorkTemplate {
  id: number;
  name: string;
  code?: string;
  description: string;
  category: string;
  unit: string;
  normative_base?: string;
  control_points?: string;
  typical_defects?: string;
  acceptance_criteria?: string;
  created_at: string;
  updated_at?: string;
}

const WorkTemplates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Общестроительные работы',
    unit: 'м²',
    normative_base: '',
    control_points: '',
    typical_defects: '',
    acceptance_criteria: '',
  });

  const categories = [
    'Общестроительные работы',
    'Кладочные работы',
    'Бетонные работы',
    'Арматурные работы',
    'Отделочные работы',
    'Плиточные работы',
    'Малярные работы',
    'Электромонтажные работы',
    'Сантехнические работы',
    'Кровельные работы',
    'Фасадные работы',
    'Благоустройство',
    'Прочие работы',
  ];

  const units = ['м²', 'м³', 'м.п.', 'шт', 'комплект', 'т', 'кг', 'л'];

  const isAdmin = user?.role === 'admin';

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
      const response = await fetch('https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add template');
      }

      toast({
        title: 'Успешно',
        description: 'Вид работы добавлен',
      });

      setIsAddOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        category: 'Общестроительные работы',
        unit: 'м²',
        normative_base: '',
        control_points: '',
        typical_defects: '',
        acceptance_criteria: '',
      });
      loadTemplates();
    } catch (error) {
      console.error('Add template error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить вид работы',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate || !formData.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf?id=${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      toast({
        title: 'Успешно',
        description: 'Вид работы обновлен',
      });

      setIsEditOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Update template error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить вид работы',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf?id=${selectedTemplate.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: 'Успешно',
        description: 'Вид работы удален',
      });

      setIsDeleteOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Delete template error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить вид работы',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (template: WorkTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      code: template.code || '',
      description: template.description,
      category: template.category,
      unit: template.unit,
      normative_base: template.normative_base || '',
      control_points: template.control_points || '',
      typical_defects: template.typical_defects || '',
      acceptance_criteria: template.acceptance_criteria || '',
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (template: WorkTemplate) => {
    setSelectedTemplate(template);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (template: WorkTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteOpen(true);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'Прочие работы';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, WorkTemplate[]>);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Общестроительные')) return 'Building2';
    if (category.includes('Отделочные') || category.includes('Малярные')) return 'Paintbrush';
    if (category.includes('Электромонтажные')) return 'Zap';
    if (category.includes('Сантехнические')) return 'Droplet';
    if (category.includes('Кровельные')) return 'Home';
    if (category.includes('Кладочные')) return 'Layers';
    if (category.includes('Бетонные')) return 'Box';
    return 'Wrench';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Справочник работ
          </h1>
          <p className="text-slate-600">Типовые виды работ для быстрого добавления в проекты</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Поиск работ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="md:w-64">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Добавить вид работы</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о новом виде работ
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Название работы *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Например: Кладка кирпича"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Код работы</Label>
                          <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Например: 123"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Краткое описание работы"
                          rows={2}
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
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
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
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="normative_base">Нормативная база</Label>
                        <Textarea
                          id="normative_base"
                          value={formData.normative_base}
                          onChange={(e) => setFormData({ ...formData, normative_base: e.target.value })}
                          placeholder="СНиПы, ГОСТы и другие нормативные документы"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="control_points">Контрольные точки</Label>
                        <Textarea
                          id="control_points"
                          value={formData.control_points}
                          onChange={(e) => setFormData({ ...formData, control_points: e.target.value })}
                          placeholder="Что проверять при приёмке работ"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="typical_defects">Типовые дефекты</Label>
                        <Textarea
                          id="typical_defects"
                          value={formData.typical_defects}
                          onChange={(e) => setFormData({ ...formData, typical_defects: e.target.value })}
                          placeholder="Часто встречающиеся нарушения"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="acceptance_criteria">Критерии приёмки</Label>
                        <Textarea
                          id="acceptance_criteria"
                          value={formData.acceptance_criteria}
                          onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                          placeholder="Требования к качеству выполненных работ"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleAddTemplate}>
                        Добавить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Загрузка...</p>
          </div>
        ) : Object.keys(groupedTemplates).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Inbox" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600">Работы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name={getCategoryIcon(category) as any} size={20} className="text-blue-600" />
                    {category}
                    <Badge variant="secondary" className="ml-2">
                      {items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-blue-200"
                        onClick={() => openViewDialog(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{template.name}</h3>
                                {template.code && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.code}
                                  </Badge>
                                )}
                              </div>
                              {template.description && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                                  {template.description}
                                </p>
                              )}
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {template.unit}
                              </Badge>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(template)}
                                >
                                  <Icon name="Pencil" size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(template)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplate?.name}
                {selectedTemplate?.code && (
                  <Badge variant="outline">{selectedTemplate.code}</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Подробная информация о виде работы
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedTemplate.category}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700">
                    {selectedTemplate.unit}
                  </Badge>
                </div>
                
                {selectedTemplate.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Описание</h4>
                    <p className="text-slate-600">{selectedTemplate.description}</p>
                  </div>
                )}

                {selectedTemplate.normative_base && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Нормативная база</h4>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedTemplate.normative_base}</p>
                    </div>
                  </>
                )}

                {selectedTemplate.control_points && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Контрольные точки</h4>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedTemplate.control_points}</p>
                    </div>
                  </>
                )}

                {selectedTemplate.typical_defects && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Типовые дефекты</h4>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedTemplate.typical_defects}</p>
                    </div>
                  </>
                )}

                {selectedTemplate.acceptance_criteria && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">Критерии приёмки</h4>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedTemplate.acceptance_criteria}</p>
                    </div>
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {isAdmin && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактировать вид работы</DialogTitle>
                <DialogDescription>
                  Изменение информации о виде работ
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Название работы *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Код работы</Label>
                    <Input
                      id="edit-code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Описание</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Категория</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="edit-unit">Единица измерения</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-normative_base">Нормативная база</Label>
                  <Textarea
                    id="edit-normative_base"
                    value={formData.normative_base}
                    onChange={(e) => setFormData({ ...formData, normative_base: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-control_points">Контрольные точки</Label>
                  <Textarea
                    id="edit-control_points"
                    value={formData.control_points}
                    onChange={(e) => setFormData({ ...formData, control_points: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-typical_defects">Типовые дефекты</Label>
                  <Textarea
                    id="edit-typical_defects"
                    value={formData.typical_defects}
                    onChange={(e) => setFormData({ ...formData, typical_defects: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-acceptance_criteria">Критерии приёмки</Label>
                  <Textarea
                    id="edit-acceptance_criteria"
                    value={formData.acceptance_criteria}
                    onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleEditTemplate}>
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        {isAdmin && (
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить вид работы?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить "{selectedTemplate?.name}"? 
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default WorkTemplates;
