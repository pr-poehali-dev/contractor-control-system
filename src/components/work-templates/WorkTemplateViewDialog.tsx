import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { WorkTemplate } from './types';

interface WorkTemplateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkTemplate | null;
}

const WorkTemplateViewDialog = ({
  open,
  onOpenChange,
  template,
}: WorkTemplateViewDialogProps) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {template.title}
            {template.code && <Badge variant="outline">{template.code}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Подробная информация о виде работы
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {template.description && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">
                Описание
              </h4>
              <p className="text-slate-600 whitespace-pre-wrap">
                {template.description}
              </p>
            </div>
          )}

          {template.normative_ref && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Нормативная база
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.normative_ref}
                </p>
              </div>
            </>
          )}

          {template.material_types && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Типовые материалы
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.material_types}
                </p>
              </div>
            </>
          )}

          {template.control_points && template.control_points.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Icon name="ClipboardCheck" size={18} />
                  Контрольные точки ({template.control_points.length})
                </h4>
                <div className="space-y-2">
                  {template.control_points.map((cp, index) => (
                    <Card key={cp.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs mt-0.5">
                            #{index + 1}
                          </Badge>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {cp.is_critical && (
                                <Badge variant="destructive" className="text-xs">
                                  Критично
                                </Badge>
                              )}
                              <span className="text-xs text-blue-600">
                                📋 {cp.standard} • {cp.standard_clause}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              {cp.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkTemplateViewDialog;