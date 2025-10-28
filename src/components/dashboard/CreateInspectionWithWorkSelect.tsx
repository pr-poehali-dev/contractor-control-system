import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch } from '@/store/hooks';
import { createInspection } from '@/store/slices/inspectionsSlice';
import { ROUTES } from '@/constants/routes';

interface CreateInspectionWithWorkSelectProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateInspectionWithWorkSelect({ isOpen, onClose }: CreateInspectionWithWorkSelectProps) {
  const navigate = useNavigate();
  const { loadUserData, userData } = useAuthRedux();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedObjectId, setSelectedObjectId] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');

  const objects = userData?.objects || [];
  const works = userData?.works || [];
  const availableWorks = works.filter((w: any) => w.object_id === Number(selectedObjectId));

  const handleCreate = async () => {
    
    if (!selectedWorkId) {
      toast({ 
        title: 'Выберите работу', 
        variant: 'destructive'
      });
      return;
    }
    
    if (scheduledDate) {
      const date = new Date(scheduledDate);
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (year !== currentYear) {
        toast({ 
          title: 'Некорректная дата', 
          description: 'Проверки можно планировать только в текущем году',
          variant: 'destructive'
        });
        return;
      }
    }
    
    setLoading(true);
    try {
      const result = await dispatch(createInspection({
        work_id: Number(selectedWorkId),
        type: scheduledDate ? 'scheduled' : 'unscheduled',
        title: 'Проверка',
        scheduled_date: scheduledDate || undefined,
        status: scheduledDate ? 'draft' : 'active'
      })).unwrap();
      
      await loadUserData();
      
      toast({ title: 'Проверка создана' });
      handleClose();
      
      if (result?.id) {
        sessionStorage.setItem('inspectionFromPage', ROUTES.DASHBOARD);
        navigate(ROUTES.INSPECTION_DETAIL(result.id));
      }
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось создать проверку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScheduledDate('');
    setSelectedObjectId('');
    setSelectedWorkId('');
    onClose();
  };

  const selectedWork = works.find((w: any) => w.id === Number(selectedWorkId));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={20} />
            Создать проверку
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm">Объект</Label>
            <Select 
              value={selectedObjectId} 
              onValueChange={(val) => {
                setSelectedObjectId(val);
                setSelectedWorkId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {objects.map((obj: any) => (
                  <SelectItem key={obj.id} value={String(obj.id)}>
                    {obj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedObjectId && (
            <div className="space-y-2">
              <Label className="text-sm">Работа</Label>
              <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите работу" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorks.map((work: any) => (
                    <SelectItem key={work.id} value={String(work.id)}>
                      {work.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Дата проверки (необязательно)</Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={`${new Date().getFullYear()}-12-31`}
              className="h-10"
            />
            <p className="text-xs text-slate-500">
              Только в текущем году. Оставьте пустым для внеплановой проверки
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={loading || !selectedWorkId}
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}