import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface NotificationsSummaryProps {
  totalMessages: number;
  totalLogs?: number;
  totalInspections?: number;
  userRole: 'client' | 'contractor' | 'admin';
  className?: string;
}

export default function NotificationsSummary({ 
  totalMessages, 
  totalLogs, 
  totalInspections,
  userRole,
  className 
}: NotificationsSummaryProps) {
  const items = [];
  
  items.push({
    icon: 'MessageCircle',
    label: 'новых сообщений',
    count: totalMessages || 0,
    color: totalMessages > 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-50'
  });
  
  if (userRole === 'client') {
    items.push({
      icon: 'FileText',
      label: 'новых отчётов',
      count: totalLogs || 0,
      color: (totalLogs || 0) > 0 ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'
    });
  }
  
  if (userRole === 'contractor') {
    items.push({
      icon: 'ClipboardCheck',
      label: 'новых проверок',
      count: totalInspections || 0,
      color: (totalInspections || 0) > 0 ? 'text-orange-600 bg-orange-50' : 'text-slate-400 bg-slate-50'
    });
  }
  
  return (
    <Card className={cn("mx-4 mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Bell" size={16} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">Новые уведомления</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
              item.color
            )}
          >
            <Icon name={item.icon} size={14} />
            <div>
              <div className="text-base font-bold leading-none mb-0.5">{item.count}</div>
              <div className="text-xs leading-none">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}