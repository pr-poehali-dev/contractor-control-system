import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { Work } from '@/contexts/AuthContext';
import { getWorkStatusInfo } from '@/utils/workStatus';

interface WorkStartNotificationProps {
  work: Work;
  onNotified: () => void;
}

export default function WorkStartNotification({ work, onNotified }: WorkStartNotificationProps) {
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);
  const statusInfo = getWorkStatusInfo(work);

  if (statusInfo.status !== 'awaiting_start') {
    return null;
  }

  const handleNotifyStart = async () => {
    setIsNotifying(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/ce0181f5-d513-442e-a0ae-fbfb21271c60', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_start',
          work_id: work.id
        })
      });

      if (response.ok) {
        toast({
          title: 'Уведомление отправлено',
          description: 'Заказчик получил уведомление о начале работ',
        });
        onNotified();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить уведомление',
        variant: 'destructive',
      });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-md mb-4">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
            <Icon name="Bell" size={20} className="text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1 text-sm md:text-base">
              Требуется уведомление о начале работ
            </h3>
            <p className="text-xs md:text-sm text-amber-800 mb-3">
              {statusInfo.daysDelayed > 0 ? (
                <>
                  Плановая дата начала прошла <span className="font-bold text-red-700">{statusInfo.daysDelayed} дн. назад</span>. 
                  Уведомите Заказчика о фактическом начале работ.
                </>
              ) : (
                <>
                  Сегодня плановая дата начала работ. Уведомите Заказчика о фактическом начале.
                </>
              )}
            </p>
            <Button 
              onClick={handleNotifyStart}
              disabled={isNotifying}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
              size="sm"
            >
              {isNotifying ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} className="mr-2" />
                  Уведомить о начале работ
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
