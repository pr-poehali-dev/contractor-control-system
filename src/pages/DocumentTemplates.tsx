import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTemplates,
  createTemplate,
  selectTemplates,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInitTemplates } from '@/hooks/useInitTemplates';
import { selectUserData } from '@/store/slices/userSlice';

export default function DocumentTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const templates = useAppSelector(selectTemplates);
  const loading = useAppSelector(selectTemplatesLoading);
  const userData = useAppSelector(selectUserData);
  
  useInitTemplates(userData?.id || null);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    template_type: 'act',
  });

  useEffect(() => {
    dispatch(fetchTemplates());
    
    (window as any).resetTemplateInit = () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('templates_initialized_'));
      keys.forEach(k => localStorage.removeItem(k));
      console.log('✅ Сброшен флаг инициализации шаблонов. Перезагрузите страницу.');
    };
    
    (window as any).forceInitTemplates = async () => {
      const userId = userData?.id;
      if (!userId) {
        console.error('❌ Пользователь не авторизован');
        return;
      }
      
      console.log('🚀 Принудительная инициализация шаблонов для user_id:', userId);
      
      try {
        const FUNC_URLS = (await import('../../backend/func2url.json')).default;
        const response = await fetch(FUNC_URLS['init-templates'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        });
        
        const result = await response.json();
        console.log('📥 Ответ сервера:', result);
        
        if (response.ok) {
          localStorage.setItem(`templates_initialized_${userId}`, 'true');
          dispatch(fetchTemplates());
          console.log('✅ Шаблоны инициализированы!');
        } else {
          console.error('❌ Ошибка:', result);
        }
      } catch (error) {
        console.error('❌ Ошибка запроса:', error);
      }
    };
  }, [dispatch, userData]);

  const extractVariablesFromContent = (content: any): string[] => {
    const vars: string[] = [];
    if (content.blocks) {
      content.blocks.forEach((block: any) => {
        if (block.value && typeof block.value === 'string' && block.value.includes('{{')) {
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || template.template_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const systemTemplates = filteredTemplates.filter(t => t.is_system);
  const userTemplates = filteredTemplates.filter(t => !t.is_system);

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
      const result = await dispatch(
        createTemplate({
          name: newTemplate.name,
          description: newTemplate.description,
          template_type: newTemplate.template_type,
          content: { blocks: [] },
        })
      ).unwrap();

      setIsCreateDialogOpen(false);
      setNewTemplate({ name: '', description: '', template_type: 'act' });

      toast({
        title: 'Шаблон создан',
        description: 'Теперь вы можете настроить его содержимое',
      });

      navigate(`/document-templates/${result.id}`);
    } catch (error) {
      console.error('Template creation error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать шаблон',
        variant: 'destructive',
      });
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      act: 'Акт работ',
      inspection: 'Акт проверки',
      defect_report: 'Акт о дефектах',
      completion: 'Акт приёмки',
      protocol: 'Протокол',
      contract: 'Договор',
      custom: 'Прочее',
    };
    return types[type] || type;
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Шаблоны документов</h1>
              <p className="text-slate-600 mt-1">Создавайте и управляйте шаблонами документов</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать шаблон
            </Button>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск шаблонов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="act">Акт работ</SelectItem>
                <SelectItem value="inspection">Акт проверки</SelectItem>
                <SelectItem value="defect_report">Акт о дефектах</SelectItem>
                <SelectItem value="completion">Акт приёмки</SelectItem>
                <SelectItem value="protocol">Протокол</SelectItem>
                <SelectItem value="contract">Договор</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || typeFilter !== 'all' ? 'Шаблоны не найдены' : 'Нет шаблонов документов'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || typeFilter !== 'all'
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первый шаблон для начала работы'}
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать шаблон
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {systemTemplates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Shield" size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Системные шаблоны</h2>
                  <Badge variant="secondary" className="text-xs">
                    {systemTemplates.length}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {systemTemplates.map((template) => {
                    const variables = extractVariablesFromContent(template.content);

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/document-templates/${template.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Icon name="FileType" size={24} className="text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{template.name}</h3>
                          <Icon name="ChevronRight" size={20} className="text-slate-400 flex-shrink-0" />
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {template.description || 'Описание отсутствует'}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {getTemplateTypeLabel(template.template_type)}
                          </Badge>
                          {template.is_active ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Активен
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Неактивен
                            </Badge>
                          )}
                        </div>

                        {variables.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {variables.slice(0, 5).map((variable, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-slate-50 text-slate-600 font-mono"
                              >
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                            {variables.length > 5 && (
                              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                                +{variables.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t">
                          {template.updated_at && (
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={12} />
                              <span>
                                Обновлён{' '}
                                {(() => {
                                  try {
                                    const date = new Date(template.updated_at);
                                    return isNaN(date.getTime()) ? 'недавно' : format(date, 'd.MM.yyyy', { locale: ru });
                                  } catch {
                                    return 'недавно';
                                  }
                                })()}
                              </span>
                            </div>
                          )}
                          {template.usage_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <Icon name="FileText" size={12} />
                              <span>Использован {template.usage_count} раз</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
                </div>
              </div>
            )}

            {userTemplates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="User" size={20} className="text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Пользовательские шаблоны</h2>
                  <Badge variant="secondary" className="text-xs">
                    {userTemplates.length}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {userTemplates.map((template) => {
                    const variables = extractVariablesFromContent(template.content);

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/document-templates/${template.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Icon name="FileType" size={24} className="text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{template.name}</h3>
                          <Icon name="ChevronRight" size={20} className="text-slate-400 flex-shrink-0" />
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {template.description || 'Описание отсутствует'}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {getTemplateTypeLabel(template.template_type)}
                          </Badge>
                          {template.is_active ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Активен
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Неактивен
                            </Badge>
                          )}
                        </div>

                        {variables.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {variables.slice(0, 5).map((variable, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-slate-50 text-slate-600 font-mono"
                              >
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                            {variables.length > 5 && (
                              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                                +{variables.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t">
                          {template.updated_at && (
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={12} />
                              <span>
                                Обновлён{' '}
                                {(() => {
                                  try {
                                    const date = new Date(template.updated_at);
                                    return isNaN(date.getTime()) ? 'недавно' : format(date, 'd.MM.yyyy', { locale: ru });
                                  } catch {
                                    return 'недавно';
                                  }
                                })()}
                              </span>
                            </div>
                          )}
                          {template.usage_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <Icon name="FileText" size={12} />
                              <span>Использован {template.usage_count} раз</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Создать шаблон</DialogTitle>
              <DialogDescription>Заполните основные параметры нового шаблона</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="template-name">
                  Название <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-name"
                  placeholder="Акт выполненных работ"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="template-type">Тип документа</Label>
                <Select
                  value={newTemplate.template_type}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value })}
                >
                  <SelectTrigger id="template-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="act">Акт работ</SelectItem>
                    <SelectItem value="inspection">Акт проверки</SelectItem>
                    <SelectItem value="defect_report">Акт о дефектах</SelectItem>
                    <SelectItem value="completion">Акт приёмки</SelectItem>
                    <SelectItem value="protocol">Протокол</SelectItem>
                    <SelectItem value="contract">Договор</SelectItem>
                    <SelectItem value="custom">Прочее</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-description">Описание</Label>
                <Textarea
                  id="template-description"
                  placeholder="Краткое описание шаблона"
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
      </div>
    </div>
  );
}