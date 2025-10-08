export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  ownerId: string;
}

export interface Site {
  id: string;
  projectId: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'pending';
}

export interface Work {
  id: string;
  siteId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  contractorId?: string;
  contractorName?: string;
}

export interface LogEntry {
  id: string;
  workId: string;
  type: 'work' | 'inspection' | 'remark' | 'system';
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'contractor';
  content: string;
  timestamp: string;
  photos?: string[];
  materials?: string[];
}

const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Проект А',
    description: 'Жилой комплекс',
    status: 'active',
    ownerId: 'test1',
  },
  {
    id: 'proj-2',
    name: 'Проект Б',
    description: 'Торговый центр',
    status: 'active',
    ownerId: 'test1',
  },
  {
    id: 'proj-3',
    name: 'Проект В',
    description: 'Образовательное учреждение',
    status: 'pending',
    ownerId: 'test1',
  },
];

const SITES: Site[] = [
  { id: 'site-1', projectId: 'proj-1', name: 'ул. Ленина, д.10', address: 'г. Москва, ул. Ленина, д.10', status: 'active' },
  { id: 'site-2', projectId: 'proj-1', name: 'ул. Гагарина, д.5', address: 'г. Москва, ул. Гагарина, д.5', status: 'active' },
  { id: 'site-3', projectId: 'proj-2', name: 'ТЦ "Центральный"', address: 'г. Москва, пр-т Мира, д.120', status: 'active' },
  { id: 'site-4', projectId: 'proj-3', name: 'Школа №12', address: 'г. Москва, ул. Школьная, д.12', status: 'pending' },
];

const WORKS: Work[] = [
  { 
    id: 'work-1', 
    siteId: 'site-1', 
    name: 'Кровля', 
    description: 'Монтаж кровельного покрытия',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик Иванов'
  },
  { 
    id: 'work-2', 
    siteId: 'site-1', 
    name: 'Фасад', 
    description: 'Облицовка фасада',
    status: 'pending',
    contractorId: 'test2',
    contractorName: 'Подрядчик Иванов'
  },
  { 
    id: 'work-3', 
    siteId: 'site-2', 
    name: 'Внутренняя отделка', 
    description: 'Штукатурные работы',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик Иванов'
  },
  { 
    id: 'work-4', 
    siteId: 'site-3', 
    name: 'Электромонтаж', 
    description: 'Прокладка электрических сетей',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик Иванов'
  },
  { 
    id: 'work-5', 
    siteId: 'site-3', 
    name: 'Отделка', 
    description: 'Финишная отделка помещений',
    status: 'completed',
  },
  { 
    id: 'work-6', 
    siteId: 'site-4', 
    name: 'Фундамент', 
    description: 'Заливка фундамента',
    status: 'pending',
  },
];

const LOG_ENTRIES: LogEntry[] = [
  {
    id: 'log-1',
    workId: 'work-1',
    type: 'work',
    authorId: 'test2',
    authorName: 'Подрядчик Иванов',
    authorRole: 'contractor',
    content: 'Завершён монтаж основного покрытия на площади 150 м². Использованы материалы согласно спецификации.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    materials: ['Профлист С-21', 'Саморезы 4.8х35'],
  },
  {
    id: 'log-2',
    workId: 'work-1',
    type: 'inspection',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Проведена проверка качества монтажа. Работа выполнена согласно проекту.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    workId: 'work-4',
    type: 'work',
    authorId: 'test2',
    authorName: 'Подрядчик Иванов',
    authorRole: 'contractor',
    content: 'Смонтированы распределительные щиты на 1-3 этажах. Проложен кабель ВВГ 3х2.5.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    materials: ['Кабель ВВГ 3х2.5 - 500м', 'Щит ЩРн 12 модулей - 3шт'],
  },
  {
    id: 'log-4',
    workId: 'work-4',
    type: 'remark',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Замечание: не все кабели промаркированы согласно схеме. Требуется исправление.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-5',
    workId: 'work-3',
    type: 'work',
    authorId: 'test2',
    authorName: 'Подрядчик Иванов',
    authorRole: 'contractor',
    content: 'Завершена штукатурка стен в квартирах 10-15. Готовность к следующему этапу через 3 дня после высыхания.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getMockData = (userId: string) => {
  if (userId === 'test3') {
    return {
      projects: [],
      sites: [],
      works: [],
      logEntries: [],
    };
  }

  if (userId === 'test2') {
    const contractorWorks = WORKS.filter(w => w.contractorId === userId);
    const contractorSiteIds = [...new Set(contractorWorks.map(w => w.siteId))];
    const contractorSites = SITES.filter(s => contractorSiteIds.includes(s.id));
    const contractorProjectIds = [...new Set(contractorSites.map(s => s.projectId))];
    const contractorProjects = PROJECTS.filter(p => contractorProjectIds.includes(p.id));
    const contractorWorkIds = contractorWorks.map(w => w.id);
    const contractorLogs = LOG_ENTRIES.filter(l => contractorWorkIds.includes(l.workId));

    return {
      projects: contractorProjects,
      sites: contractorSites,
      works: contractorWorks,
      logEntries: contractorLogs,
    };
  }

  return {
    projects: PROJECTS,
    sites: SITES,
    works: WORKS,
    logEntries: LOG_ENTRIES,
  };
};
