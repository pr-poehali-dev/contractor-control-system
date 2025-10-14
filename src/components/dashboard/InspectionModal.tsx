import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface InspectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    objectId: string;
    workId: string;
    scheduledDate: string;
    notes: string;
  };
  onFormChange: (form: any) => void;
  objects: any[];
  works: any[];
  onSubmit: () => void;
}

const InspectionModal = ({ open, onOpenChange, form, onFormChange, objects, works, onSubmit }: InspectionModalProps) => {
  const availableWorks = works.filter(w => w.object_id === Number(form.objectId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Запланировать проверку</DialogTitle>
          <DialogDescription>Выберите дату и объект для проверки</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Дата проверки</Label>
            <Input 
              type="date"
              value={form.scheduledDate}
              onChange={(e) => onFormChange({...form, scheduledDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>Объект</Label>
            <Select value={form.objectId} onValueChange={(val) => onFormChange({...form, objectId: val, workId: ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {objects.map((obj: any) => (
                  <SelectItem key={obj.id} value={String(obj.id)}>{obj.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.objectId && (
            <div>
              <Label>Работа</Label>
              <Select value={form.workId} onValueChange={(val) => onFormChange({...form, workId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите работу" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorks.map((w: any) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Примечания</Label>
            <Textarea 
              placeholder="Дополнительная информация..."
              value={form.notes}
              onChange={(e) => onFormChange({...form, notes: e.target.value})}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            Запланировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionModal;
