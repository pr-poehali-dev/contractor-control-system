import type { Work } from '@/store/slices/userSlice';

export interface WorkStatus {
  status: 'planned' | 'awaiting_start' | 'in_progress' | 'awaiting_acceptance' | 'completed' | 'delayed';
  daysDelayed: number;
  message: string;
  color: string;
  icon: string;
}

export function getWorkStatusInfo(work: Work): WorkStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!work.planned_start_date) {
    return {
      status: 'planned',
      daysDelayed: 0,
      message: 'Плановая',
      color: 'text-slate-600 bg-slate-100',
      icon: '📋'
    };
  }

  const startDate = new Date(work.planned_start_date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = work.planned_end_date ? new Date(work.planned_end_date) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  // Работа еще не началась
  if (today < startDate) {
    return {
      status: 'planned',
      daysDelayed: 0,
      message: 'Плановая',
      color: 'text-slate-600 bg-slate-100',
      icon: '📋'
    };
  }

  // Дата начала наступила, но работы не начались (start_date не заполнен и процент = 0)
  if (!work.start_date && (work.completion_percentage || 0) === 0) {
    const daysDelayed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: 'awaiting_start',
      daysDelayed,
      message: daysDelayed > 0 
        ? `Требуется подтверждение (−${daysDelayed} дн.)`
        : 'Требуется подтверждение',
      color: daysDelayed > 0 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      icon: '⏳'
    };
  }

  // Работы завершены на 100%
  if (work.completion_percentage >= 100) {
    if (endDate && today > endDate) {
      const daysDelayed = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: 'awaiting_acceptance',
        daysDelayed,
        message: `Готово к приемке (−${daysDelayed} дн.)`,
        color: 'text-amber-700 bg-amber-100',
        icon: '✅'
      };
    }
    return {
      status: 'awaiting_acceptance',
      daysDelayed: 0,
      message: 'Готово к приемке',
      color: 'text-blue-700 bg-blue-100',
      icon: '✅'
    };
  }

  // Работы в процессе, но просрочены
  if (endDate && today > endDate) {
    const daysDelayed = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      status: 'delayed',
      daysDelayed,
      message: `С задержкой (−${daysDelayed} дн.)`,
      color: 'text-red-700 bg-red-100',
      icon: '⚠️'
    };
  }

  // Работы идут по плану
  return {
    status: 'in_progress',
    daysDelayed: 0,
    message: `В процессе (${work.completion_percentage}%)`,
    color: 'text-green-700 bg-green-100',
    icon: '🔨'
  };
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Даты не указаны';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  
  if (end) {
    return `${start.toLocaleDateString('ru-RU', formatOptions)} — ${end.toLocaleDateString('ru-RU', formatOptions)}`;
  }
  
  return `с ${start.toLocaleDateString('ru-RU', formatOptions)}`;
}

export interface ObjectStatus {
  status: 'planning' | 'in_progress' | 'completed';
  message: string;
  color: string;
  icon: string;
}

export function getObjectStatusInfo(works: Work[]): ObjectStatus {
  if (works.length === 0) {
    return {
      status: 'planning',
      message: 'Запланировано',
      color: 'text-slate-600 bg-slate-100',
      icon: '📋'
    };
  }

  const allCompleted = works.every(work => work.completion_percentage >= 100);
  if (allCompleted) {
    return {
      status: 'completed',
      message: 'Работы завершены',
      color: 'text-green-700 bg-green-100',
      icon: '✅'
    };
  }

  const anyStarted = works.some(work => work.start_date || (work.completion_percentage || 0) > 0);
  if (anyStarted) {
    return {
      status: 'in_progress',
      message: 'Работы начаты',
      color: 'text-blue-700 bg-blue-100',
      icon: '🔨'
    };
  }

  return {
    status: 'planning',
    message: 'Запланировано',
    color: 'text-slate-600 bg-slate-100',
    icon: '📋'
  };
}