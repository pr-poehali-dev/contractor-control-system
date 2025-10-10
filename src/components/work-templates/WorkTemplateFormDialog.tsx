import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { WorkTemplateFormData } from './types';

interface WorkTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: WorkTemplateFormData;
  onFormDataChange: (data: WorkTemplateFormData) => void;
  onSubmit: () => void;
  submitLabel: string;
}

const WorkTemplateFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onFormDataChange,
  onSubmit,
  submitLabel,
}: WorkTemplateFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название работы *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
              placeholder="Например: Устройство кровли из металлочерепицы"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Код работы (ФЕР/ЕНиР)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                onFormDataChange({ ...formData, code: e.target.value })
              }
              placeholder="ФЕР12-01-007-01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание работы</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Монтаж кровельного покрытия из металлочерепицы на обрешётку с креплением саморезами, включая установку коньков, ендов, снегозадержателей. Контроль: Уклон кровли ≥ 14°, нахлёст листов..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="normative_ref">
              Нормативная база (ГОСТ, СП, СНиП)
            </Label>
            <Input
              id="normative_ref"
              value={formData.normative_ref}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  normative_ref: e.target.value,
                })
              }
              placeholder="СП 17.13330.2017 «Кровли», ГОСТ 24045-2016"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material_types">Типовые материалы</Label>
            <Textarea
              id="material_types"
              value={formData.material_types}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  material_types: e.target.value,
                })
              }
              placeholder="металлочерепица, деревянная обрешётка, саморезы с уплотнителем"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkTemplateFormDialog;
