import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import TiptapEditor from '@/components/TiptapEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTemplateDetail,
  updateTemplate,
  selectCurrentTemplate,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateBlock {
  id: string;
  type: 'header' | 'text' | 'field' | 'table';
  label?: string;
  value?: string;
  style?: Record<string, any>;
}

export default function DocumentTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);
  
  const [blocks, setBlocks] = useState<TemplateBlock[]>([]);
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] = useState(false);
  const [newBlockType, setNewBlockType] = useState<'header' | 'text' | 'field' | 'table'>('text');
  const [editingBlock, setEditingBlock] = useState<TemplateBlock | null>(null);
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentVariables, setDocumentVariables] = useState<string[]>([]);

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetail(parseInt(templateId)));
    }
  }, [dispatch, templateId]);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      
      if (template.content) {
        if (template.content.blocks) {
          setBlocks(template.content.blocks);
        }
        if (template.content.html) {
          setDocumentContent(template.content.html);
        }
        if (template.content.variables) {
          setDocumentVariables(template.content.variables);
        }
      }
    }
  }, [template]);

  const extractVariables = (): string[] => {
    const vars = new Set<string>();
    blocks.forEach((block) => {
      if (block.value) {
        const matches = block.value.match(/\{\{([^}]+)\}\}/g);
        if (matches) {
          matches.forEach((match) => {
            const varName = match.replace(/[{}]/g, '').trim();
            vars.add(varName);
          });
        }
      }
    });
    return Array.from(vars);
  };

  const handleAddBlock = () => {
    const newBlock: TemplateBlock = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      label: newBlockType === 'header' ? 'Заголовок' : newBlockType === 'field' ? 'Поле' : '',
      value: newBlockType === 'text' ? 'Введите текст...' : newBlockType === 'field' ? '{{переменная}}' : '',
    };

    setBlocks([...blocks, newBlock]);
    setIsAddBlockDialogOpen(false);
    setNewBlockType('text');
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleUpdateBlock = (id: string, updates: Partial<TemplateBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const handleSave = async () => {
    if (!templateId || !template) return;

    try {
      const content = template.template_type === 'document' 
        ? { html: documentContent, variables: documentVariables }
        : { blocks };

      await dispatch(
        updateTemplate({
          id: parseInt(templateId),
          name: templateName,
          description: templateDescription,
          content,
        })
      ).unwrap();

      toast({
        title: 'Шаблон сохранён',
        description: 'Изменения успешно сохранены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить шаблон',
        variant: 'destructive',
      });
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (!editingBlock) return;
    
    const currentValue = editingBlock.value || '';
    const newValue = `${currentValue} {{${variable}}}`;
    handleUpdateBlock(editingBlock.id, { value: newValue });
    setEditingBlock(null);
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'header': return 'Heading';
      case 'text': return 'Type';
      case 'field': return 'FileInput';
      case 'table': return 'Table';
      default: return 'FileText';
    }
  };

  const getBlockLabel = (type: string) => {
    switch (type) {
      case 'header': return 'Заголовок';
      case 'text': return 'Текст';
      case 'field': return 'Поле';
      case 'table': return 'Таблица';
      default: return type;
    }
  };

  if (loading && !template) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Icon name="FileQuestion" size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Шаблон не найден</h3>
          <Button onClick={() => navigate('/document-templates')} className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  const variables = extractVariables();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/document-templates')}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Редактор шаблона</h1>
            </div>
            <Button onClick={handleSave}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Название шаблона</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Название шаблона"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Описание</Label>
                  <Textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Краткое описание"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {template.template_type === 'document' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Редактор документа</CardTitle>
                </CardHeader>
                <CardContent>
                  <TiptapEditor
                    content={documentContent}
                    onChange={setDocumentContent}
                    placeholder="Начните писать документ..."
                    variables={documentVariables}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Содержимое шаблона</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsAddBlockDialogOpen(true)}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить блок
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {blocks.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileText" size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">Шаблон пуст</p>
                    <Button variant="outline" onClick={() => setIsAddBlockDialogOpen(true)}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить первый блок
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <Card key={block.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name={getBlockIcon(block.type) as any} size={20} className="text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getBlockLabel(block.type)}
                                </Badge>
                                <span className="text-sm text-slate-500">Блок #{index + 1}</span>
                              </div>

                              {block.label && (
                                <div>
                                  <Label className="text-xs text-slate-500">Метка</Label>
                                  <Input
                                    value={block.label}
                                    onChange={(e) => handleUpdateBlock(block.id, { label: e.target.value })}
                                    className="mt-1"
                                    placeholder="Название блока"
                                  />
                                </div>
                              )}

                              <div>
                                <Label className="text-xs text-slate-500">Содержимое</Label>
                                <Textarea
                                  value={block.value || ''}
                                  onChange={(e) => handleUpdateBlock(block.id, { value: e.target.value })}
                                  className="mt-1 font-mono text-sm"
                                  rows={block.type === 'header' ? 1 : 3}
                                  placeholder="Введите текст или {{переменная}}"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingBlock(block)}
                                >
                                  <Icon name="Plus" size={14} className="mr-1.5" />
                                  Вставить переменную
                                </Button>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBlock(block.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          <div className="space-y-6">
            {template.template_type === 'document' ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Переменные</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const varName = prompt('Название переменной:');
                        if (varName && !documentVariables.includes(varName)) {
                          setDocumentVariables([...documentVariables, varName]);
                        }
                      }}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {documentVariables.length === 0 ? (
                    <p className="text-sm text-slate-500">Добавьте переменные для шаблона</p>
                  ) : (
                    <div className="space-y-2">
                      {documentVariables.map((variable) => (
                        <div key={variable} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                          <code className="text-sm font-mono">{`{{${variable}}}`}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocumentVariables(documentVariables.filter(v => v !== variable))}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Переменные ({variables.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {variables.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Используйте переменные в формате <code className="bg-slate-100 px-1 rounded">{'{{name}}'}</code>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="font-mono text-xs cursor-pointer hover:bg-blue-50"
                          onClick={() => editingBlock && handleInsertVariable(variable)}
                        >
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Подсказки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <strong className="block mb-1">Заголовок</strong>
                  <p className="text-xs">Используйте для названий разделов</p>
                </div>
                <div>
                  <strong className="block mb-1">Текст</strong>
                  <p className="text-xs">Основной текст документа</p>
                </div>
                <div>
                  <strong className="block mb-1">Поле</strong>
                  <p className="text-xs">Динамические данные через переменные</p>
                </div>
                <div>
                  <strong className="block mb-1">Переменные</strong>
                  <p className="text-xs">
                    Формат: <code className="bg-slate-100 px-1 rounded">{'{{имя}}'}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isAddBlockDialogOpen} onOpenChange={setIsAddBlockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить блок</DialogTitle>
              <DialogDescription>Выберите тип блока для добавления</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Тип блока</Label>
              <Select value={newBlockType} onValueChange={(val: any) => setNewBlockType(val)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Заголовок</SelectItem>
                  <SelectItem value="text">Текстовый блок</SelectItem>
                  <SelectItem value="field">Поле с переменной</SelectItem>
                  <SelectItem value="table">Таблица</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddBlockDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddBlock}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вставить переменную</DialogTitle>
              <DialogDescription>Выберите переменную или введите новую</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {variables.length > 0 && (
                <div>
                  <Label>Доступные переменные</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variables.map((variable, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="font-mono cursor-pointer hover:bg-blue-50"
                        onClick={() => handleInsertVariable(variable)}
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Или введите новую</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="имя_переменной"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleInsertVariable(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}