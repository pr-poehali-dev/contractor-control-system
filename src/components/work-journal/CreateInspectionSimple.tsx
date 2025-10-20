import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface CreateInspectionSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  workId: number;
}

export default function CreateInspectionSimple({ isOpen, onClose, workId }: CreateInspectionSimpleProps) {
  const navigate = useNavigate();
  const { token, loadUserData, userData, user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const handleCreate = async () => {
    if (!token || !user?.id) return;
    
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
      const result = await api.createItem(token, 'inspection', {
        work_id: workId,
        type: scheduledDate ? 'scheduled' : 'unscheduled',
        title: 'Проверка',
        scheduled_date: scheduledDate || undefined,
        status: scheduledDate ? 'draft' : 'active'
      });
      
      console.log('Created inspection:', result);
      
      // Event is created automatically by backend
      // Backend returns {success: true, data: {id, ...}}
      const inspectionId = result?.data?.id;
      
      if (!inspectionId) {
        console.error('No inspection ID returned, result:', result);
        throw new Error('Не удалось получить ID проверки');
      }
      
      onClose();
      
      toast({ 
        title: scheduledDate ? 'Проверка запланирована' : 'Проверка создана',
        description: scheduledDate ? `Проверка назначена на ${new Date(scheduledDate).toLocaleDateString('ru-RU')}` : 'Переход на страницу проверки...'
      });
      
      // Navigate immediately before loading user data
      sessionStorage.setItem('inspectionFromPage', window.location.pathname);
      navigate(`/inspection/${inspectionId}`);
      
      // Load data in background
      loadUserData();
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
    onClose();
  };

  const work = userData?.works?.find((w: any) => w.id === workId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={20} />
            Создать проверку
          </DialogTitle>
          {work && (
            <p className="text-sm text-slate-600 mt-2">
              {work.title}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}