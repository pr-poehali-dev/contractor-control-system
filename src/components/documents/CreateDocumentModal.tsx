import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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
  onSelectTemplate: (templateId: number, templateName: string) => void;
}

export default function CreateDocumentModal({
  isOpen,
  onClose,
  templates,
  loading = false,
  onSelectTemplate
}: CreateDocumentModalProps) {
  // Системные = копии эталонов (с source_template_id)
  const systemTemplates = templates
    .filter(t => t.source_template_id !== null && t.source_template_id !== undefined)
    .filter((template, index, self) => 
      index === self.findIndex(t => t.name === template.name)
    );
  
  // Пользовательские = обычные шаблоны (без is_system и без source_template_id)
  const userTemplates = templates
    .filter(t => !t.is_system && !t.source_template_id)
    .filter((template, index, self) => 
      index === self.findIndex(t => t.name === template.name)
    );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={24} className="text-blue-600" />
            Создать документ
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Выберите шаблон документа для начала работы
          </p>
        </DialogHeader>

        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileX" size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Нет доступных шаблонов</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh]">
              <div className="space-y-6 pr-4">
                {/* Системные шаблоны */}
                {systemTemplates.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Shield" size={18} className="text-purple-600" />
                      <h3 className="font-semibold text-slate-900">Системные шаблоны</h3>
                      <Badge variant="secondary" className="text-xs">{systemTemplates.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {systemTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300 group"
                          onClick={() => {
                            onSelectTemplate(template.id, template.name);
                            onClose();
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                              <Icon name="FileType" size={20} className="text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                                {template.name}
                              </h3>
                              {template.description && (
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <Icon 
                              name="ChevronRight" 
                              size={20} 
                              className="text-slate-400 group-hover:text-purple-600 transition-colors" 
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пользовательские шаблоны */}
                {userTemplates.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="User" size={18} className="text-slate-600" />
                      <h3 className="font-semibold text-slate-900">Пользовательские шаблоны</h3>
                      <Badge variant="secondary" className="text-xs">{userTemplates.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 group"
                          onClick={() => {
                            onSelectTemplate(template.id, template.name);
                            onClose();
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                              <Icon name="FileText" size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {template.name}
                              </h3>
                              {template.description && (
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <Icon 
                              name="ChevronRight" 
                              size={20} 
                              className="text-slate-400 group-hover:text-blue-600 transition-colors" 
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : systemTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileX" size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">Нет доступных шаблонов</p>
                    <p className="text-sm text-slate-400 mt-2">Создайте шаблон в разделе "Шаблоны"</p>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}