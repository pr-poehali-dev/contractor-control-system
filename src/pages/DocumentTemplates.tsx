import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  selectTemplates,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentTemplate {
  id: number;
  name: string;
  description: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

const mockTemplatesForFallback: DocumentTemplate[] = [
  {
    id: 1,
    name: 'Акт выполненных работ',
    description: 'Стандартный шаблон акта для подтверждения выполненных работ',
    content: 'Акт выполненных работ №{{number}} от {{date}}\n\nИсполнитель: {{contractor}}\nЗаказчик: {{client}}\n\nВыполнены следующие работы:\n{{works_list}}\n\nОбщая стоимость: {{total_amount}} руб.',
    variables: ['number', 'date', 'contractor', 'client', 'works_list', 'total_amount'],
    createdAt: '2025-10-15T10:00:00',
    updatedAt: '2025-10-20T14:30:00',
  },
  {
    id: 2,
    name: 'Договор подряда',
    description: 'Типовой договор на выполнение строительно-монтажных работ',
    content: 'Договор подряда №{{contract_number}}\n\nЗаказчик: {{client_name}}, ИНН {{client_inn}}\nПодрядчик: {{contractor_name}}, ИНН {{contractor_inn}}\n\nПредмет договора: {{subject}}\nСрок выполнения: {{deadline}}\nСтоимость работ: {{amount}} руб.',
    variables: ['contract_number', 'client_name', 'client_inn', 'contractor_name', 'contractor_inn', 'subject', 'deadline', 'amount'],
    createdAt: '2025-09-20T09:15:00',
    updatedAt: '2025-10-10T16:45:00',
  },
];

export default function DocumentTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const templatesFromRedux = useAppSelector(selectTemplates);
  const loading = useAppSelector(selectTemplatesLoading);
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplatesForFallback);
  
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);
  
  useEffect(() => {
    if (templatesFromRedux.length > 0) {
      setTemplates(templatesFromRedux.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        content: JSON.stringify(t.content),
        variables: extractVariablesFromContent(t.content),
        createdAt: t.created_at,
        updatedAt: t.updated_at
      })));
    }
  }, [templatesFromRedux]);
  
  const extractVariablesFromContent = (content: any): string[] => {
    const vars: string[] = [];
    if (content.blocks) {
      content.blocks.forEach((block: any) => {
        if (block.value && block.value.includes('{{')) {
          const matches = block.value.match(/\{\{([^}]+)\}\}/g);
          if (matches) {
            matches.forEach((m: string) => {
              const varName = m.replace(/[{}]/g, '').trim();
              if (!vars.includes(varName)) vars.push(varName);
            });
          }
        }
      });
    }
    return vars;
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
  });

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название шаблона',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await dispatch(createTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        template_type: 'custom',
        content: { blocks: [] }
      })).unwrap();
      
      setIsCreateDialogOpen(false);
      setNewTemplate({ name: '', description: '' });
      
      toast({
        title: 'Шаблон создан',
        description: 'Теперь вы можете настроить его содержимое',
      });

      navigate(`/document-templates/${result.id}`);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать шаблон',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete === null) return;

    setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete));
    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);

    toast({
      title: 'Шаблон удалён',
      description: 'Шаблон документа успешно удалён',
    });
  };

  const openDeleteDialog = (id: number) => {
    setTemplateToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Шаблоны документов</h1>
              <p className="text-slate-600 mt-1">Создавайте и управляйте шаблонами документов</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="md:h-10">
              <Icon name="Plus" size={16} className="md:mr-2" />
              <span className="hidden md:inline">Создать шаблон</span>
            </Button>
          </div>

          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск шаблонов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="FileText" size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 mb-4">
                {searchQuery ? 'Шаблоны не найдены' : 'Пока нет шаблонов документов'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать первый шаблон
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/document-templates/${template.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg text-slate-900">{template.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/document-templates/${template.id}`)}>
                          <Icon name="Edit" size={16} className="mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(template.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Icon name="Trash2" size={16} className="mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {template.variables.slice(0, 5).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs font-mono">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                    {template.variables.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 5}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Обновлён {new Date(template.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создание шаблона документа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название шаблона *</Label>
              <Input
                id="name"
                placeholder="Например: Акт выполненных работ"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Краткое описание назначения шаблона"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTemplate}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление шаблона</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            Вы уверены, что хотите удалить этот шаблон? Это действие нельзя будет отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}