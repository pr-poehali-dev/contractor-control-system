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
    projectId: string;
    objectId: string;
    workId: string;
    scheduledDate: string;
    notes: string;
  };
  onFormChange: (form: any) => void;
  projects: any[];
  onSubmit: () => void;
}

const InspectionModal = ({ open, onOpenChange, form, onFormChange, projects, onSubmit }: InspectionModalProps) => {
  const selectedProject = projects.find(p => p.id === Number(form.projectId));
  const selectedObject = selectedProject?.objects?.find((o: any) => o.id === Number(form.objectId));
  const availableWorks = selectedObject?.works || [];

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
            <Label>Проект</Label>
            <Select value={form.projectId} onValueChange={(val) => onFormChange({...form, projectId: val, objectId: '', workId: ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.projectId && (
            <div>
              <Label>Объект</Label>
              <Select value={form.objectId} onValueChange={(val) => onFormChange({...form, objectId: val, workId: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите объект" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject?.objects?.map((o: any) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
            <Label>Примечания (необязательно)</Label>
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
