import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type ProjectStatus = 'active' | 'planning' | 'completed';
type WorkStatus = 'inProgress' | 'review' | 'completed' | 'defects';

interface Work {
  id: string;
  name: string;
  contractor: string;
  status: WorkStatus;
  progress: number;
  defectsCount: number;
  lastCheck: string;
}

interface ProjectObject {
  id: string;
  address: string;
  works: Work[];
  totalProgress: number;
}

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  objectsCount: number;
  totalWorks: number;
  progress: number;
  objects: ProjectObject[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Капремонт Казани 2025',
    status: 'active',
    objectsCount: 12,
    totalWorks: 48,
    progress: 67,
    objects: [
      {
        id: '1-1',
        address: 'ул. Ленина, д. 10',
        totalProgress: 75,
        works: [
          { id: 'w1', name: 'Замена кровли', contractor: 'ООО "СтройМастер"', status: 'inProgress', progress: 80, defectsCount: 2, lastCheck: '2025-10-05' },
          { id: 'w2', name: 'Ремонт фасада', contractor: 'ООО "СтройМастер"', status: 'review', progress: 100, defectsCount: 0, lastCheck: '2025-10-06' },
          { id: 'w3', name: 'Замена окон', contractor: 'ИП Иванов', status: 'completed', progress: 100, defectsCount: 0, lastCheck: '2025-09-28' },
        ]
      },
      {
        id: '1-2',
        address: 'ул. Пушкина, д. 5',
        totalProgress: 45,
        works: [
          { id: 'w4', name: 'Ремонт подъездов', contractor: 'ООО "Ремонт+"', status: 'inProgress', progress: 45, defectsCount: 1, lastCheck: '2025-10-04' },
          { id: 'w5', name: 'Утепление чердака', contractor: 'ООО "ТеплоДом"', status: 'defects', progress: 30, defectsCount: 5, lastCheck: '2025-10-03' },
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Благоустройство дворов',
    status: 'active',
    objectsCount: 8,
    totalWorks: 24,
    progress: 34,
    objects: []
  },
  {
    id: '3',
    name: 'Реконструкция школ',
    status: 'planning',
    objectsCount: 5,
    totalWorks: 35,
    progress: 12,
    objects: []
  }
];

const getStatusBadge = (status: WorkStatus) => {
  const variants = {
    inProgress: { label: 'В работе', variant: 'default' as const, color: 'bg-blue-500' },
    review: { label: 'На проверке', variant: 'secondary' as const, color: 'bg-yellow-500' },
    completed: { label: 'Завершено', variant: 'outline' as const, color: 'bg-green-500' },
    defects: { label: 'Есть замечания', variant: 'destructive' as const, color: 'bg-red-500' }
  };
  return variants[status];
};

const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedObject, setSelectedObject] = useState<ProjectObject | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-lg flex items-center justify-center">
                <Icon name="HardHat" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Подряд-ПРО</h1>
                <p className="text-sm text-slate-500">Система строительного контроля</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Icon name="Bell" size={20} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Settings" size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">ИП</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Инспектор Петров</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-fade-in hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Всего проектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Building2" className="text-[#2563EB]" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">3</p>
                  <p className="text-xs text-slate-500">активных</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Объектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="MapPin" className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">25</p>
                  <p className="text-xs text-slate-500">в работе</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Работ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="ClipboardCheck" className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">107</p>
                  <p className="text-xs text-slate-500">контролируется</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in hover-scale" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Замечания</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon name="AlertCircle" className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">8</p>
                  <p className="text-xs text-slate-500">требуют внимания</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Проекты</h2>
          <p className="text-slate-600">Выберите проект для просмотра деталей</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project, index) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover-scale animate-fade-in transition-shadow hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-bold text-slate-900">{project.name}</CardTitle>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status === 'active' ? 'Активен' : project.status === 'planning' ? 'Планирование' : 'Завершён'}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm mt-3">
                    <span className="flex items-center gap-1">
                      <Icon name="Building" size={16} />
                      {project.objectsCount} объектов
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Wrench" size={16} />
                      {project.totalWorks} работ
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Прогресс</span>
                    <span className="font-semibold text-[#2563EB]">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={!!selectedProject} onOpenChange={() => { setSelectedProject(null); setSelectedObject(null); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedProject && !selectedObject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                <DialogDescription>
                  {selectedProject.objectsCount} объектов • {selectedProject.totalWorks} работ
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                {selectedProject.objects.map((obj) => (
                  <Card 
                    key={obj.id} 
                    className="cursor-pointer hover-scale"
                    onClick={() => setSelectedObject(obj)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Icon name="MapPin" className="text-slate-600" size={20} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{obj.address}</CardTitle>
                            <CardDescription>{obj.works.length} работ</CardDescription>
                          </div>
                        </div>
                        <Icon name="ChevronRight" className="text-slate-400" size={20} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Общий прогресс</span>
                          <span className="font-semibold text-[#2563EB]">{obj.totalProgress}%</span>
                        </div>
                        <Progress value={obj.totalProgress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {selectedObject && (
            <>
              <DialogHeader>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedObject(null)}
                  className="w-fit mb-2"
                >
                  <Icon name="ChevronLeft" size={16} />
                  Назад к объектам
                </Button>
                <DialogTitle className="text-2xl">{selectedObject.address}</DialogTitle>
                <DialogDescription>
                  {selectedProject?.name} • {selectedObject.works.length} работ
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="all" className="mt-6">
                <TabsList>
                  <TabsTrigger value="all">Все работы</TabsTrigger>
                  <TabsTrigger value="inProgress">В работе</TabsTrigger>
                  <TabsTrigger value="defects">Замечания</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-3 mt-4">
                  {selectedObject.works.map((work) => (
                    <Card 
                      key={work.id} 
                      className="cursor-pointer hover-scale"
                      onClick={() => setSelectedWork(work)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{work.name}</h3>
                            <p className="text-sm text-slate-600 mb-2">Подрядчик: {work.contractor}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadge(work.status).variant}>
                                {getStatusBadge(work.status).label}
                              </Badge>
                              {work.defectsCount > 0 && (
                                <Badge variant="destructive">
                                  {work.defectsCount} замечаний
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Icon name="ChevronRight" className="text-slate-400" size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Прогресс</span>
                            <span className="font-semibold">{work.progress}%</span>
                          </div>
                          <Progress value={work.progress} className="h-1.5" />
                          <p className="text-xs text-slate-500 mt-1">Последняя проверка: {work.lastCheck}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="inProgress" className="space-y-3 mt-4">
                  {selectedObject.works.filter(w => w.status === 'inProgress').map((work) => (
                    <Card key={work.id} className="cursor-pointer hover-scale">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-slate-900">{work.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{work.contractor}</p>
                        <Progress value={work.progress} className="h-1.5 mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="defects" className="space-y-3 mt-4">
                  {selectedObject.works.filter(w => w.defectsCount > 0).map((work) => (
                    <Card key={work.id} className="border-red-200 cursor-pointer hover-scale">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{work.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">{work.contractor}</p>
                          </div>
                          <Badge variant="destructive">{work.defectsCount}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
        <DialogContent className="max-w-2xl">
          {selectedWork && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedWork.name}</DialogTitle>
                <DialogDescription>
                  Подрядчик: {selectedWork.contractor}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadge(selectedWork.status).variant} className="text-base py-1.5 px-3">
                    {getStatusBadge(selectedWork.status).label}
                  </Badge>
                  {selectedWork.defectsCount > 0 && (
                    <Badge variant="destructive" className="text-base py-1.5 px-3">
                      <Icon name="AlertTriangle" size={16} className="mr-1" />
                      {selectedWork.defectsCount} замечаний
                    </Badge>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Прогресс выполнения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Выполнено</span>
                        <span className="text-2xl font-bold text-[#2563EB]">{selectedWork.progress}%</span>
                      </div>
                      <Progress value={selectedWork.progress} className="h-3" />
                      <p className="text-xs text-slate-500 mt-2">Последняя проверка: {selectedWork.lastCheck}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full" size="lg">
                    <Icon name="ClipboardCheck" size={20} className="mr-2" />
                    Журнал работ
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Icon name="FileText" size={20} className="mr-2" />
                    Смета
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Icon name="Search" size={20} className="mr-2" />
                    Проверки
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Icon name="BarChart3" size={20} className="mr-2" />
                    Аналитика
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
