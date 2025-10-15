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
  start_date?: string;
  end_date?: string;
}

interface WorkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  formData: EditFormData;
  setFormData: (data: EditFormData) => void;
  contractors: Contractor[];
  isSubmitting: boolean;
  canDelete?: boolean;
}

export default function WorkEditDialog({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData,
  contractors,
  isSubmitting,
  canDelete = true,
}: WorkEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
          <DialogTitle className="text-lg sm:text-xl">Редактировать работу</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium">Название</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-10"
                placeholder="Введите название работы"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="resize-none"
                placeholder="Описание работы"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date" className="text-sm font-medium">Плановое начало</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date" className="text-sm font-medium">Плановое окончание</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-contractor" className="text-sm font-medium">Подрядчик</Label>
              <Select 
                value={formData.contractor_id || 'none'} 
                onValueChange={(value) => setFormData({ ...formData, contractor_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger id="edit-contractor" className="h-10">
                  <SelectValue placeholder="Выберите подрядчика" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без подрядчика</SelectItem>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id.toString()}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-sm font-medium">Статус</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="edit-status" className="h-10">
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
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-3 p-4 sm:px-6 sm:py-4 border-t bg-slate-50/50">
          {canDelete && onDelete && (
            <Button 
              variant="outline" 
              onClick={onDelete}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:mr-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
            </Button>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Отмена
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}