import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  WorkTemplate,
  WorkTemplateFormData,
} from '@/components/work-templates/types';
import WorkTemplateFormDialog from '@/components/work-templates/WorkTemplateFormDialog';
import WorkTemplateViewDialog from '@/components/work-templates/WorkTemplateViewDialog';
import WorkTemplateDeleteDialog from '@/components/work-templates/WorkTemplateDeleteDialog';
import WorkTemplateCard from '@/components/work-templates/WorkTemplateCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

const WorkTemplates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkTemplate | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<WorkTemplateFormData>({
    title: '',
    code: '',
    description: '',
    normative_ref: '',
    material_types: '',
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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
    if (!formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        'https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add template');
      }

      toast({
        title: 'Успешно',
        description: 'Вид работы добавлен',
      });

      setIsAddOpen(false);
      setFormData({
        title: '',
        code: '',
        description: '',
        normative_ref: '',
        material_types: '',
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
    if (!selectedTemplate || !formData.title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название работы',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf?id=${selectedTemplate.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

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
      const response = await fetch(
        `https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf?id=${selectedTemplate.id}`,
        {
          method: 'DELETE',
        }
      );

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
      title: template.title,
      code: template.code || '',
      description: template.description || '',
      normative_ref: template.normative_ref || '',
      material_types: template.material_types || '',
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
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.normative_ref
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Справочник работ
          </h1>
          <p className="text-slate-600">
            Типовые виды строительных работ с привязкой к ГОСТ, СНиП и ФЕР
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icon
                    name="Search"
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    placeholder="Поиск работ по названию, коду, нормативу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {isAdmin && (
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить работу
                    </Button>
                  </DialogTrigger>
                  <WorkTemplateFormDialog
                    open={isAddOpen}
                    onOpenChange={setIsAddOpen}
                    title="Добавить вид работы"
                    description="Заполните информацию о новом виде работ"
                    formData={formData}
                    onFormDataChange={setFormData}
                    onSubmit={handleAddTemplate}
                    submitLabel="Добавить"
                  />
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Загрузка...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Inbox" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600">Работы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <WorkTemplateCard
                key={template.id}
                template={template}
                isAdmin={isAdmin}
                onView={openViewDialog}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>
        )}

        <WorkTemplateViewDialog
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          template={selectedTemplate}
        />

        {isAdmin && (
          <>
            <WorkTemplateFormDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              title="Редактировать вид работы"
              description="Изменение информации о виде работ"
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleEditTemplate}
              submitLabel="Сохранить"
            />

            <WorkTemplateDeleteDialog
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
              template={selectedTemplate}
              onConfirm={handleDeleteTemplate}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default WorkTemplates;
