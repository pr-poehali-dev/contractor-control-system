import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

interface NotificationBadgeProps {
  count: number;
  icon?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function NotificationBadge({ count, icon, className, size = 'sm' }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  const sizeClasses = {
    xs: 'text-[9px] px-0.5 min-w-[14px] h-3.5',
    sm: 'text-[10px] px-1 min-w-[16px] h-4',
    md: 'text-xs px-1.5 min-w-[20px] h-5'
  };
  
  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14
  };
  
  return (
    <div className={cn(
      'inline-flex items-center gap-0.5 bg-red-500 text-white rounded-full font-medium',
      sizeClasses[size],
      className
    )}>
      {icon && <Icon name={icon} size={iconSizes[size]} />}
      <span>{count > 99 ? '99+' : count}</span>
    </div>
  );
}

interface NotificationGroupProps {
  messages?: number;
  logs?: number;
  inspections?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function NotificationGroup({ messages, logs, inspections, className, size = 'sm' }: NotificationGroupProps) {
  const hasNotifications = (messages || 0) > 0 || (logs || 0) > 0 || (inspections || 0) > 0;
  
  if (!hasNotifications) return null;
  
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {messages && messages > 0 && (
        <NotificationBadge count={messages} icon="MessageCircle" size={size} />
      )}
      {logs && logs > 0 && (
        <NotificationBadge count={logs} icon="FileText" size={size} />
      )}
      {inspections && inspections > 0 && (
        <NotificationBadge count={inspections} icon="ClipboardCheck" size={size} />
      )}
    </div>
  );
}