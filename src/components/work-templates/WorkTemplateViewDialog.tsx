import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            {template.code && <Badge variant="outline">{template.code}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Подробная информация о виде работы
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-700">
              {template.category}
            </Badge>
            <Badge className="bg-slate-100 text-slate-700">
              {template.unit}
            </Badge>
          </div>

          {template.description && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">
                Описание
              </h4>
              <p className="text-slate-600">{template.description}</p>
            </div>
          )}

          {template.normative_base && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Нормативная база
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.normative_base}
                </p>
              </div>
            </>
          )}

          {template.control_points && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Контрольные точки
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.control_points}
                </p>
              </div>
            </>
          )}

          {template.typical_defects && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Типовые дефекты
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.typical_defects}
                </p>
              </div>
            </>
          )}

          {template.acceptance_criteria && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">
                  Критерии приёмки
                </h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {template.acceptance_criteria}
                </p>
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
