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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newTemplate: {
    name: string;
    description: string;
    template_type: string;
  };
  onTemplateChange: (template: { name: string; description: string; template_type: string }) => void;
  onSubmit: () => void;
}

export function CreateTemplateDialog({
  isOpen,
  onOpenChange,
  newTemplate,
  onTemplateChange,
  onSubmit,
}: CreateTemplateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              placeholder="Например: Акт выполненных работ"
              value={newTemplate.name}
              onChange={(e) => onTemplateChange({ ...newTemplate, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="template-description">Описание</Label>
            <Textarea
              id="template-description"
              placeholder="Краткое описание назначения шаблона"
              value={newTemplate.description}
              onChange={(e) => onTemplateChange({ ...newTemplate, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="template-type">Тип шаблона</Label>
            <Select
              value={newTemplate.template_type}
              onValueChange={(value) => onTemplateChange({ ...newTemplate, template_type: value })}
            >
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="act">Акт работ</SelectItem>
                <SelectItem value="protocol">Протокол</SelectItem>
                <SelectItem value="contract">Договор</SelectItem>
                <SelectItem value="custom">Прочее</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}