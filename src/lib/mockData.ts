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

export interface Inspection {
  id: string;
  workId: string;
  number: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'completed';
  checkpoints: InspectionCheckpoint[];
}

export interface InspectionCheckpoint {
  id: string;
  title: string;
  standard: string;
  status: 'ok' | 'violation' | 'pending';
  remarkId?: string;
}

export interface Remark {
  id: string;
  inspectionId: string;
  checkpointId: string;
  description: string;
  createdAt: string;
  status: 'open' | 'resolved';
  photos?: string[];
}

export interface LogEntry {
  id: string;
  workId: string;
  type: 'work' | 'inspection_created' | 'inspection_completed' | 'remark' | 'act_signed';
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'contractor';
  content: string;
  timestamp: string;
  photos?: string[];
  materials?: string[];
  inspectionId?: string;
  remarkId?: string;
}

const PROJECTS: Project[] = [
  {
    id: 'proj-test1-1',
    name: 'Капремонт Казани 2025',
    description: 'Капитальный ремонт жилых домов',
    status: 'active',
    ownerId: 'test1',
  },
  {
    id: 'proj-test1-2',
    name: 'Благоустройство домов',
    description: 'Благоустройство придомовых территорий',
    status: 'active',
    ownerId: 'test1',
  },
  {
    id: 'proj-test1-3',
    name: 'Реконструкция школы №12',
    description: 'Реконструкция образовательного учреждения',
    status: 'pending',
    ownerId: 'test1',
  },
];

const SITES: Site[] = [
  { id: 'site-1', projectId: 'proj-test1-1', name: 'ул. Ленина, д.10', address: 'г. Казань, ул. Ленина, д.10', status: 'active' },
  { id: 'site-2', projectId: 'proj-test1-1', name: 'ул. Гагарина, д.5', address: 'г. Казань, ул. Гагарина, д.5', status: 'active' },
  { id: 'site-3', projectId: 'proj-test1-2', name: 'Парк Победы', address: 'г. Казань, Парк Победы', status: 'active' },
  { id: 'site-4', projectId: 'proj-test1-2', name: 'Детская площадка на ул. Строителей', address: 'г. Казань, ул. Строителей, д.15', status: 'active' },
  { id: 'site-5', projectId: 'proj-test1-3', name: 'Школа №12', address: 'г. Казань, ул. Школьная, д.12', status: 'pending' },
];

const WORKS: Work[] = [
  { 
    id: 'work-1', 
    siteId: 'site-1', 
    name: 'Кровля', 
    description: 'Замена кровельного покрытия',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик А'
  },
  { 
    id: 'work-2', 
    siteId: 'site-1', 
    name: 'Фасад', 
    description: 'Облицовка фасада',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик А'
  },
  { 
    id: 'work-3', 
    siteId: 'site-2', 
    name: 'Внутренняя отделка', 
    description: 'Штукатурные работы',
    status: 'active',
    contractorId: 'test2',
    contractorName: 'Подрядчик А'
  },
  { 
    id: 'work-4', 
    siteId: 'site-3', 
    name: 'Асфальтирование', 
    description: 'Укладка асфальтового покрытия',
    status: 'active',
    contractorId: 'contractor-b',
    contractorName: 'Подрядчик Б'
  },
  { 
    id: 'work-5', 
    siteId: 'site-4', 
    name: 'Установка оборудования', 
    description: 'Монтаж детских игровых комплексов',
    status: 'active',
    contractorId: 'contractor-b',
    contractorName: 'Подрядчик Б'
  },
  { 
    id: 'work-6', 
    siteId: 'site-5', 
    name: 'Фундамент', 
    description: 'Укрепление фундамента',
    status: 'pending',
    contractorId: 'contractor-c',
    contractorName: 'Подрядчик В'
  },
];

const INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    workId: 'work-1',
    number: '45',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'test1',
    status: 'completed',
    checkpoints: [
      { id: 'cp-1', title: 'Качество материала', standard: 'ГОСТ 24045-2016', status: 'ok' },
      { id: 'cp-2', title: 'Герметичность соединений', standard: 'СНиП 3.04.01-87', status: 'violation', remarkId: 'rem-1' },
      { id: 'cp-3', title: 'Уклон кровли', standard: 'СП 17.13330.2017', status: 'ok' },
    ],
  },
  {
    id: 'insp-2',
    workId: 'work-4',
    number: '48',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'test1',
    status: 'active',
    checkpoints: [
      { id: 'cp-4', title: 'Толщина слоя асфальта', standard: 'ГОСТ 9128-2013', status: 'pending' },
      { id: 'cp-5', title: 'Уплотнение покрытия', standard: 'СП 78.13330.2012', status: 'pending' },
    ],
  },
];

const REMARKS: Remark[] = [
  {
    id: 'rem-1',
    inspectionId: 'insp-1',
    checkpointId: 'cp-2',
    description: 'Обнаружены негерметичные стыки между листами кровельного материала. Требуется дополнительная герметизация согласно СНиП 3.04.01-87, п. 4.5.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
  },
];

const LOG_ENTRIES: LogEntry[] = [
  {
    id: 'log-1',
    workId: 'work-1',
    type: 'work',
    authorId: 'test2',
    authorName: 'Подрядчик А',
    authorRole: 'contractor',
    content: 'Завершён монтаж кровельного покрытия на площади 150 м². Использованы материалы согласно спецификации.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    materials: ['Металлочерепица Монтеррей - 160 м²', 'Саморезы кровельные - 2500 шт'],
  },
  {
    id: 'log-2',
    workId: 'work-1',
    type: 'inspection_created',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Создана проверка №45',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    inspectionId: 'insp-1',
  },
  {
    id: 'log-3',
    workId: 'work-1',
    type: 'remark',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Добавлено замечание: нарушение СНиП 3.04.01-87 — негерметичные стыки между листами',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    inspectionId: 'insp-1',
    remarkId: 'rem-1',
  },
  {
    id: 'log-4',
    workId: 'work-1',
    type: 'inspection_completed',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Проверка №45 завершена',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    inspectionId: 'insp-1',
  },
  {
    id: 'log-5',
    workId: 'work-1',
    type: 'act_signed',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Акт №45 подписан',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    inspectionId: 'insp-1',
  },
  {
    id: 'log-6',
    workId: 'work-3',
    type: 'work',
    authorId: 'test2',
    authorName: 'Подрядчик А',
    authorRole: 'contractor',
    content: 'Завершена штукатурка стен в квартирах 10-15. Готовность к следующему этапу через 3 дня.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-7',
    workId: 'work-4',
    type: 'work',
    authorId: 'contractor-b',
    authorName: 'Подрядчик Б',
    authorRole: 'contractor',
    content: 'Уложено 200 м² асфальтового покрытия. Температура укладки +150°C.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-8',
    workId: 'work-4',
    type: 'inspection_created',
    authorId: 'test1',
    authorName: 'Заказчик Петров',
    authorRole: 'customer',
    content: 'Создана проверка №48',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    inspectionId: 'insp-2',
  },
];

export const getMockData = (userId: string) => {
  if (userId === 'test3') {
    return {
      projects: [],
      sites: [],
      works: [],
      inspections: [],
      remarks: [],
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
    const contractorInspections = INSPECTIONS.filter(i => contractorWorkIds.includes(i.workId));
    const contractorInspectionIds = contractorInspections.map(i => i.id);
    const contractorRemarks = REMARKS.filter(r => contractorInspectionIds.includes(r.inspectionId));

    return {
      projects: contractorProjects,
      sites: contractorSites,
      works: contractorWorks,
      inspections: contractorInspections,
      remarks: contractorRemarks,
      logEntries: contractorLogs,
    };
  }

  const customerProjects = PROJECTS.filter(p => p.ownerId === userId);
  const customerProjectIds = customerProjects.map(p => p.id);
  const customerSites = SITES.filter(s => customerProjectIds.includes(s.projectId));
  const customerSiteIds = customerSites.map(s => s.id);
  const customerWorks = WORKS.filter(w => customerSiteIds.includes(w.siteId));
  const customerWorkIds = customerWorks.map(w => w.id);
  const customerLogs = LOG_ENTRIES.filter(l => customerWorkIds.includes(l.workId));
  const customerInspections = INSPECTIONS.filter(i => customerWorkIds.includes(i.workId));
  const customerInspectionIds = customerInspections.map(i => i.id);
  const customerRemarks = REMARKS.filter(r => customerInspectionIds.includes(r.inspectionId));

  return {
    projects: customerProjects,
    sites: customerSites,
    works: customerWorks,
    inspections: customerInspections,
    remarks: customerRemarks,
    logEntries: customerLogs,
  };
};
