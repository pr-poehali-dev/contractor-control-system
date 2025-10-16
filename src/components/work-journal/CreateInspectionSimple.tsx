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
    
    setLoading(true);
    try {
      const result = await api.createItem(token, 'inspection', {
        work_id: workId,
        type: scheduledDate ? 'scheduled' : 'unscheduled',
        title: 'Проверка',
        scheduled_date: scheduledDate || undefined,
        status: scheduledDate ? 'draft' : 'active'
      });
      
      // Event is created automatically by backend
      
      await loadUserData();
      
      toast({ 
        title: scheduledDate ? 'Проверка запланирована' : 'Проверка создана',
        description: scheduledDate ? `Проверка назначена на ${new Date(scheduledDate).toLocaleDateString('ru-RU')}` : 'Переход на страницу проверки...'
      });
      onClose();
      
      // Always navigate to inspection page after creation
      if (result?.id) {
        sessionStorage.setItem('inspectionFromPage', window.location.pathname);
        navigate(`/inspection/${result.id}`);
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
              className="h-10"
            />
            <p className="text-xs text-slate-500">
              Оставьте пустым для внеплановой проверки
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