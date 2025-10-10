import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { WorkTemplateFormData, CATEGORIES, UNITS } from './types';

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название работы *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                placeholder="Например: Кладка кирпича"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код работы</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  onFormDataChange({ ...formData, code: e.target.value })
                }
                placeholder="Например: 123"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Краткое описание работы"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Единица измерения</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, unit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="normative_base">Нормативная база</Label>
            <Textarea
              id="normative_base"
              value={formData.normative_base}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  normative_base: e.target.value,
                })
              }
              placeholder="СНиПы, ГОСТы и другие нормативные документы"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="control_points">Контрольные точки</Label>
            <Textarea
              id="control_points"
              value={formData.control_points}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  control_points: e.target.value,
                })
              }
              placeholder="Что проверять при приёмке работ"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="typical_defects">Типовые дефекты</Label>
            <Textarea
              id="typical_defects"
              value={formData.typical_defects}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  typical_defects: e.target.value,
                })
              }
              placeholder="Часто встречающиеся нарушения"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acceptance_criteria">Критерии приёмки</Label>
            <Textarea
              id="acceptance_criteria"
              value={formData.acceptance_criteria}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  acceptance_criteria: e.target.value,
                })
              }
              placeholder="Требования к качеству выполненных работ"
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
