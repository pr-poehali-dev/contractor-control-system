import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { selectInspections } from '@/store/slices/inspectionsSlice';

interface Template {
  id: number;
  name: string;
  description?: string;
  category?: string;
  htmlContent?: string;
  is_system?: boolean;
  template_type?: string;
  source_template_id?: number | null;
}

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  loading?: boolean;
  onSelectTemplate: (templateId: number, templateName: string, relatedData?: any) => void;
}

export default function CreateDocumentModal({
  isOpen,
  onClose,
  templates,
  loading = false,
  onSelectTemplate
}: CreateDocumentModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>('');
  
  const inspections = useAppSelector(selectInspections);
  
  const systemTemplates = templates
    .filter(t => t.source_template_id !== null && t.source_template_id !== undefined)
    .filter((template, index, self) => 
      index === self.findIndex(t => t.name === template.name)
    );
  
  const userTemplates = templates
    .filter(t => !t.is_system && !t.source_template_id)
    .filter((template, index, self) => 
      index === self.findIndex(t => t.name === template.name)
    );

  const allTemplates = [...systemTemplates, ...userTemplates];
  
  const selectedTemplate = allTemplates.find(t => t.id.toString() === selectedTemplateId);
  
  const needsInspection = selectedTemplate?.name?.toLowerCase().includes('дефект');

  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplateId('');
      setSelectedInspectionId('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!selectedTemplateId) return;
    
    const templateId = parseInt(selectedTemplateId);
    const templateName = selectedTemplate?.name || '';
    
    let relatedData = undefined;
    if (needsInspection && selectedInspectionId) {
      const inspection = inspections.find(i => i.id.toString() === selectedInspectionId);
      relatedData = { inspection };
    }
    
    onSelectTemplate(templateId, templateName, relatedData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FilePlus" size={24} className="text-blue-600" />
            Создать документ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template">Шаблон документа *</Label>
            <Select 
              value={selectedTemplateId} 
              onValueChange={setSelectedTemplateId}
              disabled={loading}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Выберите шаблон" />
              </SelectTrigger>
              <SelectContent>
                {systemTemplates.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                      Системные шаблоны
                    </div>
                    {systemTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon name="Shield" size={14} className="text-purple-600" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {userTemplates.length > 0 && (
                  <>
                    {systemTemplates.length > 0 && (
                      <div className="h-px bg-slate-200 my-1" />
                    )}
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                      Пользовательские шаблоны
                    </div>
                    {userTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" size={14} className="text-blue-600" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {selectedTemplate?.description && (
              <p className="text-xs text-slate-500 mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {needsInspection && (
            <div className="space-y-2">
              <Label htmlFor="inspection">Проверка *</Label>
              <Select 
                value={selectedInspectionId} 
                onValueChange={setSelectedInspectionId}
              >
                <SelectTrigger id="inspection">
                  <SelectValue placeholder="Выберите проверку" />
                </SelectTrigger>
                <SelectContent>
                  {inspections.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-slate-500">
                      Нет доступных проверок
                    </div>
                  ) : (
                    inspections.map((inspection) => (
                      <SelectItem key={inspection.id} value={inspection.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{inspection.title}</span>
                          <span className="text-xs text-slate-500">
                            #{inspection.inspection_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Данные проверки будут использованы для заполнения документа
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!selectedTemplateId || (needsInspection && !selectedInspectionId)}
          >
            <Icon name="FilePlus" size={16} className="mr-2" />
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
