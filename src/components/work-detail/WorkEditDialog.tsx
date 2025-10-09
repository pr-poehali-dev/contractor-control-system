import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Contractor } from '@/lib/api';

interface EditFormData {
  title: string;
  description: string;
  contractor_id: string;
  status: string;
}

interface WorkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: EditFormData;
  setFormData: (data: EditFormData) => void;
  contractors: Contractor[];
  isSubmitting: boolean;
}

export default function WorkEditDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  contractors,
  isSubmitting,
}: WorkEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать работу</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contractor">Подрядчик</Label>
            <Select 
              value={formData.contractor_id} 
              onValueChange={(value) => setFormData({ ...formData, contractor_id: value })}
            >
              <SelectTrigger id="edit-contractor">
                <SelectValue placeholder="Выберите подрядчика" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без подрядчика</SelectItem>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor.id} value={contractor.id.toString()}>
                    {contractor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Статус</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">В работе</SelectItem>
                <SelectItem value="pending">Ожидание</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="on_hold">Приостановлено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
