import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface NotificationsSummaryProps {
  totalMessages: number;
  totalLogs?: number;
  totalInspections?: number;
  userRole: 'client' | 'contractor' | 'admin';
}

export default function NotificationsSummary({ 
  totalMessages, 
  totalLogs, 
  totalInspections,
  userRole 
}: NotificationsSummaryProps) {
  const hasNotifications = totalMessages > 0 || (totalLogs || 0) > 0 || (totalInspections || 0) > 0;
  
  if (!hasNotifications) return null;
  
  const items = [];
  
  if (totalMessages > 0) {
    items.push({
      icon: 'MessageCircle',
      label: 'новых сообщений',
      count: totalMessages,
      color: 'text-blue-600 bg-blue-50'
    });
  }
  
  if (userRole === 'client' && totalLogs && totalLogs > 0) {
    items.push({
      icon: 'FileText',
      label: 'новых отчётов',
      count: totalLogs,
      color: 'text-green-600 bg-green-50'
    });
  }
  
  if (userRole === 'contractor' && totalInspections && totalInspections > 0) {
    items.push({
      icon: 'ClipboardCheck',
      label: 'новых проверок',
      count: totalInspections,
      color: 'text-orange-600 bg-orange-50'
    });
  }
  
  return (
    <Card className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Bell" size={20} className="text-blue-600" />
        <h3 className="font-semibold text-slate-900">Новые уведомления</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              item.color
            )}
          >
            <Icon name={item.icon} size={18} />
            <div>
              <div className="text-xl font-bold">{item.count}</div>
              <div className="text-sm">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
