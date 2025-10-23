import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import type { Work } from '@/store/slices/userSlice';
import { getWorkStatusInfo } from '@/utils/workStatus';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

interface WorkStartNotificationProps {
  work: Work;
  onNotified: () => void;
}

export default function WorkStartNotification({ work, onNotified }: WorkStartNotificationProps) {
  const { toast } = useToast();
  const { token, loadUserData } = useAuthRedux();
  const [isNotifying, setIsNotifying] = useState(false);
  const statusInfo = getWorkStatusInfo(work);

  if (statusInfo.status !== 'awaiting_start') {
    return null;
  }

  const handleNotifyStart = async () => {
    setIsNotifying(true);
    
    try {
      const updateResponse = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, {
        type: 'work',
        id: work.id,
        data: {
          start_date: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      });

      if (!updateResponse.success) {
        console.error('Update failed:', updateResponse.error);
        throw new Error(updateResponse.error || 'Failed to update work');
      }

      if (token) {
        await loadUserData();
      }

      const createLogResponse = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, {
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
      });

      if (createLogResponse.success) {
        if (token) {
          await loadUserData();
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