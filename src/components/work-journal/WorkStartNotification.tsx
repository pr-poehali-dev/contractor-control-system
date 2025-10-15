import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Work } from '@/contexts/AuthContext';
import { getWorkStatusInfo } from '@/utils/workStatus';

interface WorkStartNotificationProps {
  work: Work;
  onNotified: () => void;
}

export default function WorkStartNotification({ work, onNotified }: WorkStartNotificationProps) {
  const { toast } = useToast();
  const { token, setUserData } = useAuth();
  const [isNotifying, setIsNotifying] = useState(false);
  const statusInfo = getWorkStatusInfo(work);

  if (statusInfo.status !== 'awaiting_start') {
    return null;
  }

  const handleNotifyStart = async () => {
    setIsNotifying(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const updateResponse = await fetch('https://functions.poehali.dev/b69598bf-df90-4a71-93a1-6108c6c39317', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          type: 'work',
          id: work.id,
          data: {
            start_date: new Date().toISOString().split('T')[0],
            status: 'active'
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update work');
      }

      if (token) {
        const refreshedData = await api.getUserData(token);
        setUserData(refreshedData);
      }

      const createLogResponse = await fetch('https://functions.poehali.dev/8d57b03e-49c5-4589-abfb-691e6e084c6a', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          type: 'work_log',
          data: {
            work_id: work.id,
            description: '🚀 Начало работ',
            progress: 0,
            volume: null,
            materials: null,
            photo_urls: null,
            is_work_start: true
          }
        })
      });

      if (createLogResponse.ok) {
        if (token) {
          const refreshedData = await api.getUserData(token);
          setUserData(refreshedData);
        }
        
        toast({
          title: 'Уведомление отправлено',
          description: 'Заказчик получил уведомление о начале работ',
        });
        onNotified();
      } else {
        throw new Error('Failed to create work log entry');
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
              Требуется подтверждение начала работ
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