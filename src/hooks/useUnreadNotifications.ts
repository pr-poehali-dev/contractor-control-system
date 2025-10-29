import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';

export function useUnreadNotifications() {
  const works = useAppSelector((state) => state.works.items);
  const userDataUnreadCounts = useAppSelector((state) => state.user.userData?.unreadCounts);
  
  const totalUnread = useMemo(() => {
    if (!userDataUnreadCounts) return 0;
    
    let total = 0;
    works.forEach(work => {
      const counts = userDataUnreadCounts[work.id];
      if (counts) {
        total += (counts.messages || 0) + (counts.logs || 0) + (counts.inspections || 0);
      }
    });
    
    return total;
  }, [works, userDataUnreadCounts]);

  const displayCount = totalUnread > 99 ? '99+' : totalUnread.toString();
  
  return {
    totalUnread,
    displayCount,
    hasUnread: totalUnread > 0
  };
}
