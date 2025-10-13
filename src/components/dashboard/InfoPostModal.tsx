import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface InfoPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    title: string;
    content: string;
    link: string;
  };
  onFormChange: (form: any) => void;
  onSubmit: () => void;
}

const InfoPostModal = ({ open, onOpenChange, form, onFormChange, onSubmit }: InfoPostModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Создать инфо-пост</DialogTitle>
          <DialogDescription>Уведомление увидят все пользователи системы</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Заголовок</Label>
            <Input 
              placeholder="Новый регламент приемки работ"
              value={form.title}
              onChange={(e) => onFormChange({...form, title: e.target.value})}
            />
          </div>

          <div>
            <Label>Содержание</Label>
            <Textarea 
              placeholder="С 2025 года вводится новый регламент..."
              value={form.content}
              onChange={(e) => onFormChange({...form, content: e.target.value})}
              rows={6}
            />
          </div>

          <div>
            <Label>Ссылка (необязательно)</Label>
            <Input 
              placeholder="https://example.com/document.pdf"
              value={form.link}
              onChange={(e) => onFormChange({...form, link: e.target.value})}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            Опубликовать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoPostModal;
