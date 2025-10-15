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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <Icon name="ClipboardCheck" size={18} className="md:hidden" />
            <Icon name="ClipboardCheck" size={20} className="hidden md:block" />
            Создать проверку
          </DialogTitle>
          {work && (
            <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2 line-clamp-2">
              {work.title}
            </p>
          )}
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            <p className="text-xs md:text-sm text-slate-600">Выберите тип проверки:</p>
            
            <div className="grid gap-2.5 md:gap-3">
              <Card 
                className="cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                onClick={() => handleTypeSelect('scheduled')}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="Calendar" size={20} className="text-blue-600 md:hidden" />
                      <Icon name="Calendar" size={24} className="text-blue-600 hidden md:block" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base md:text-lg mb-0.5 md:mb-1">Плановая проверка</h3>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Запланировать проверку на конкретную дату
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                onClick={() => handleTypeSelect('unscheduled')}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="Zap" size={20} className="text-amber-600 md:hidden" />
                      <Icon name="Zap" size={24} className="text-amber-600 hidden md:block" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base md:text-lg mb-0.5 md:mb-1">Внеплановая проверка</h3>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Провести проверку прямо сейчас
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 mb-2 md:mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('type')}
                className="h-8 px-2 md:px-3"
              >
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Назад
              </Button>
              <span className="text-xs md:text-sm">
                {inspectionType === 'scheduled' ? '📅 Плановая' : '⚡ Внеплановая'}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Название проверки *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Проверка качества работ"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Дополнительная информация..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {inspectionType === 'scheduled' && (
              <div className="space-y-1.5">
                <Label className="text-sm">Дата проверки *</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-10 text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm">Примечания</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Дополнительные примечания..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 text-sm"
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1 h-10 text-sm"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать проверку'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}