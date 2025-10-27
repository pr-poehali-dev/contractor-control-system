import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTemplates,
  createTemplate,
  selectTemplates,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import { useInitTemplates } from '@/hooks/useInitTemplates';
import { selectUserData } from '@/store/slices/userSlice';
import { TemplatesLoading } from '@/components/document-templates/TemplatesLoading';
import { TemplatesHeader } from '@/components/document-templates/TemplatesHeader';
import { EmptyTemplatesState } from '@/components/document-templates/EmptyTemplatesState';
import { TemplatesList } from '@/components/document-templates/TemplatesList';
import { CreateTemplateDialog } from '@/components/document-templates/CreateTemplateDialog';

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
    if (content.variables && Array.isArray(content.variables)) {
      return content.variables.map((v: any) => 
        typeof v === 'string' ? v : (v.variable || v.name || '')
      ).filter((v: string) => v);
    }
    
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
    
    // Скрываем эталоны (is_system=true) для обычных пользователей
    const isAdmin = userData?.id === 6;
    if (template.is_system && !isAdmin) {
      return false;
    }
    
    return matchesSearch && matchesType;
  });

  const systemTemplates = filteredTemplates.filter(t => t.is_system || t.source_template_id);
  const userTemplates = filteredTemplates.filter(t => !t.is_system && !t.source_template_id);

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
      defect_detection: 'Обнаружение дефектов',
      defect_resolution: 'Устранение дефектов',
      work_acceptance: 'Приёмка работ',
      completion: 'Акт приёмки',
      protocol: 'Протокол',
      contract: 'Договор',
      custom: 'Прочее',
    };
    return types[type] || type;
  };

  if (loading && templates.length === 0) {
    return <TemplatesLoading />;
  }

  const hasFilters = searchQuery || typeFilter !== 'all';
  const hasTemplates = filteredTemplates.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <TemplatesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />

        {!hasTemplates ? (
          <EmptyTemplatesState
            hasFilters={hasFilters}
            onCreateClick={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <TemplatesList
            systemTemplates={systemTemplates}
            userTemplates={userTemplates}
            extractVariables={extractVariablesFromContent}
            getTemplateTypeLabel={getTemplateTypeLabel}
            onTemplateClick={(id) => navigate(`/document-templates/${id}`)}
          />
        )}

        <CreateTemplateDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          newTemplate={newTemplate}
          onTemplateChange={setNewTemplate}
          onSubmit={handleCreateTemplate}
        />
      </div>
    </div>
  );
}