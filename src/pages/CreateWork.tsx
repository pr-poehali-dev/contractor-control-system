import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface WorkTemplate {
  id: string;
  name: string;
  category: string;
  unit: string;
}

interface GroupedTemplates {
  [category: string]: WorkTemplate[];
}

const CreateWork = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, setUserData, userData } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    volume: '',
    unit: '',
    start_date: '',
    end_date: '',
    estimated_cost: '',
    contractor_id: '',
    priority: 'medium',
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplates>({});
  const [hasContractors, setHasContractors] = useState(true);
  const [showNoContractorsDialog, setShowNoContractorsDialog] = useState(false);
  const [contractorDialogShown, setContractorDialogShown] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Load work templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch(
          'https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf'
        );
        const data = await response.json();
        
        const workTypes = data.work_types || [];
        if (Array.isArray(workTypes)) {
          setTemplates(workTypes.map((t: any) => ({
            id: String(t.id),
            name: t.title || t.name,
            category: t.category || 'Общестроительные работы',
            unit: 'м²',
          })));
          
          // Group templates by category
          const grouped = workTypes.reduce((acc: GroupedTemplates, template: any) => {
            const cat = template.category || 'Общестроительные работы';
            const tmpl: WorkTemplate = {
              id: String(template.id),
              name: template.title || template.name,
              category: cat,
              unit: 'м²',
            };
            if (!acc[cat]) {
              acc[cat] = [];
            }
            acc[cat].push(tmpl);
            return acc;
          }, {});
          
          setGroupedTemplates(grouped);
        }
      } catch (error) {
        console.error('Failed to load work templates:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить шаблоны работ',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [toast]);

  // Check if user has contractors
  useEffect(() => {
    if (userData?.contractors && Array.isArray(userData.contractors) && !contractorDialogShown) {
      const contractorsCount = userData.contractors.length;
      setHasContractors(contractorsCount > 0);
      
      if (contractorsCount === 0) {
        setShowNoContractorsDialog(true);
        setContractorDialogShown(true);
      }
    }
  }, [userData, contractorDialogShown]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData({
        ...formData,
        title: selectedTemplate.name,
        unit: selectedTemplate.unit,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !objectId) return;

    setIsSubmitting(true);

    try {
      const result = await api.createItem(token!, 'work', {
        object_id: Number(objectId),
        title: formData.title,
        description: formData.description,
        contractor_id: formData.contractor_id ? Number(formData.contractor_id) : null,
        status: 'active',
      });

      const newWorkId = result.data.id;
      
      if (token) {
        const refreshedData = await api.getUserData(token);
        setUserData(refreshedData);
      }

      toast({
        title: 'Работа создана!',
        description: `Работа "${formData.title}" успешно добавлена`,
      });

      setTimeout(() => {
        navigate(`/objects/${objectId}/works/${newWorkId}`);
      }, 300);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать работу',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleAddContractor = () => {
    navigate('/contractors');
  };

  const handleContinueWithoutContractor = () => {
    setShowNoContractorsDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24 md:pb-8">
      <AlertDialog open={showNoContractorsDialog} onOpenChange={setShowNoContractorsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>У вас пока нет подрядчиков с которыми вы работаете</AlertDialogTitle>
            <AlertDialogDescription>
              Чтобы назначать работы подрядчикам, сначала добавьте их в систему. Вы также можете продолжить без подрядчика и добавить его позже.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueWithoutContractor}>
              Продолжить без подрядчика
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddContractor}>
              Добавить подрядчика
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/objects/${objectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К объекту
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Создание работы</h1>
        <p className="text-slate-600">Укажите вид работ для данного объекта</p>
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
                <Label htmlFor="title">Название работы *</Label>
                <Select 
                  value={selectedTemplateId} 
                  onValueChange={handleTemplateSelect}
                  disabled={isLoadingTemplates}
                >
                  <SelectTrigger data-tour="work-title-input">
                    <SelectValue placeholder={isLoadingTemplates ? "Загрузка шаблонов..." : "Выберите вид работ"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedTemplates).map(([category, items]) => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {items.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание работ</Label>
                <Textarea
                  id="description"
                  placeholder="Подробное описание работ..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Объём работ</Label>
                  <Input
                    id="volume"
                    type="number"
                    placeholder="0"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Единица измерения</Label>
                  <Input
                    id="unit"
                    placeholder="м², м³, шт..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Плановое начало</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Плановое окончание</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Плановая стоимость (руб.)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    placeholder="0"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Приоритет</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Подрядчик</Label>
                <Select 
                  value={formData.contractor_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, contractor_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подрядчика (необязательно)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без подрядчика</SelectItem>
                    {((userData?.contractors && Array.isArray(userData.contractors)) ? userData.contractors : []).map((contractor: any) => (
                      <SelectItem key={contractor.id} value={contractor.id.toString()}>
                        {contractor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasContractors && (
                  <p className="text-sm text-slate-500">
                    У вас пока нет подрядчиков.{' '}
                    <button
                      type="button"
                      onClick={handleAddContractor}
                      className="text-blue-600 hover:underline"
                    >
                      Добавить подрядчика
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row gap-3 lg:col-span-2">
          <Button 
            type="submit" 
            size="lg" 
            className="md:min-w-[200px]"
            disabled={isSubmitting}
            data-tour="create-work-submit"
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Icon name="Save" size={20} className="mr-2" />
                Создать работу
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
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
                <p className="font-medium text-slate-900">📑 Описание</p>
                <p className="text-xs">Укажите ссылки на нормативы и требования к выполнению</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">📅 Сроки</p>
                <p className="text-xs">Учитывайте время на согласования и проверки</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-slate-900">🔥 Приоритет</p>
                <p className="text-xs">Высокий приоритет - для критичных работ на критическом пути</p>
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
                <p>Назначьте подрядчика на работу</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">2.</span>
                <p>Создайте первую запись в журнале работ</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-green-600">3.</span>
                <p>Отслеживайте прогресс и вносите замечания</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateWork;