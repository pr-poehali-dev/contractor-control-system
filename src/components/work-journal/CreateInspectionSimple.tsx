import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { token, loadUserData, userData } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [inspectionType, setInspectionType] = useState<'scheduled' | 'unscheduled'>('scheduled');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    notes: ''
  });

  const handleTypeSelect = (type: 'scheduled' | 'unscheduled') => {
    setInspectionType(type);
    setStep('form');
    
    if (type === 'unscheduled') {
      setForm(prev => ({ ...prev, scheduledDate: '' }));
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название проверки', variant: 'destructive' });
      return;
    }
    
    if (inspectionType === 'scheduled' && !form.scheduledDate) {
      toast({ title: 'Укажите дату проверки', variant: 'destructive' });
      return;
    }
    
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await api.createItem(token, 'inspection', {
        work_id: workId,
        type: inspectionType,
        title: form.title,
        description: form.description,
        scheduled_date: inspectionType === 'scheduled' ? form.scheduledDate : undefined,
        notes: form.notes,
        status: 'pending'
      });
      
      await loadUserData();
      
      toast({ title: 'Проверка создана' });
      onClose();
      
      if (result?.id) {
        navigate(`/inspections/${result.id}`);
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
    setStep('type');
    setForm({ title: '', description: '', scheduledDate: '', notes: '' });
    onClose();
  };

  const work = userData?.works?.find((w: any) => w.id === workId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={20} />
            Создать проверку
          </DialogTitle>
          {work && (
            <p className="text-sm text-slate-600 mt-2">
              Работа: {work.title}
            </p>
          )}
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">Выберите тип проверки:</p>
            
            <div className="grid gap-3">
              <Card 
                className="cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                onClick={() => handleTypeSelect('scheduled')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="Calendar" size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Плановая проверка</h3>
                      <p className="text-sm text-slate-600">
                        Запланировать проверку на конкретную дату. Подрядчик получит уведомление.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                onClick={() => handleTypeSelect('unscheduled')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="Zap" size={24} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Внеплановая проверка</h3>
                      <p className="text-sm text-slate-600">
                        Провести незапланированную проверку работ прямо сейчас.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('type')}
              >
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Назад
              </Button>
              <span>
                {inspectionType === 'scheduled' ? '📅 Плановая проверка' : '⚡ Внеплановая проверка'}
              </span>
            </div>

            <div>
              <Label>Название проверки *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Проверка качества работ"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Дополнительная информация о проверке..."
                rows={3}
              />
            </div>

            {inspectionType === 'scheduled' && (
              <div>
                <Label>Дата проверки *</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div>
              <Label>Примечания</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Дополнительные примечания..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
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
                {loading ? 'Создание...' : 'Создать и перейти к проверке'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
