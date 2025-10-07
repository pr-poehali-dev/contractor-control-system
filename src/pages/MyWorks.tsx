import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

type WorkStatus = 'inProgress' | 'review' | 'completed' | 'defects';

interface Work {
  id: string;
  name: string;
  project: string;
  object: string;
  status: WorkStatus;
  progress: number;
  defectsCount: number;
  lastUpdate: string;
  deadline: string;
}

const mockWorks: Work[] = [
  {
    id: 'w1',
    name: 'Замена кровли',
    project: 'Капремонт Казани 2025',
    object: 'ул. Ленина, д. 10',
    status: 'inProgress',
    progress: 80,
    defectsCount: 2,
    lastUpdate: '05.10.2025',
    deadline: '15.10.2025'
  },
  {
    id: 'w2',
    name: 'Ремонт фасада',
    project: 'Капремонт Казани 2025',
    object: 'ул. Ленина, д. 10',
    status: 'review',
    progress: 100,
    defectsCount: 0,
    lastUpdate: '06.10.2025',
    deadline: '10.10.2025'
  },
  {
    id: 'w4',
    name: 'Ремонт подъездов',
    project: 'Капремонт Казани 2025',
    object: 'ул. Пушкина, д. 5',
    status: 'defects',
    progress: 45,
    defectsCount: 6,
    lastUpdate: '04.10.2025',
    deadline: '20.10.2025'
  },
];

const getStatusBadge = (status: WorkStatus) => {
  const variants = {
    inProgress: { label: 'В работе', variant: 'default' as const },
    review: { label: 'На проверке', variant: 'secondary' as const },
    completed: { label: 'Завершено', variant: 'outline' as const },
    defects: { label: 'Есть замечания', variant: 'destructive' as const }
  };
  return variants[status];
};

const MyWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Мои работы</h1>
        <p className="text-slate-600">Работы, закреплённые за вашей организацией</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{mockWorks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">
              {mockWorks.filter(w => w.status === 'inProgress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">На проверке</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {mockWorks.filter(w => w.status === 'review').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Замечания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {mockWorks.reduce((sum, w) => sum + w.defectsCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все работы</TabsTrigger>
          <TabsTrigger value="inProgress">В работе</TabsTrigger>
          <TabsTrigger value="review">На проверке</TabsTrigger>
          <TabsTrigger value="defects">С замечаниями</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {mockWorks.map((work, index) => (
            <Card 
              key={work.id}
              className="cursor-pointer hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/my-works/${work.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{work.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-2">
                        <Icon name="FolderKanban" size={14} />
                        {work.project}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} />
                        {work.object}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="Calendar" size={14} />
                        Срок: {work.deadline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(work.status).variant}>
                        {getStatusBadge(work.status).label}
                      </Badge>
                      {work.defectsCount > 0 && (
                        <Badge variant="destructive">
                          <Icon name="AlertTriangle" size={12} className="mr-1" />
                          {work.defectsCount} замечаний
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Icon name="ChevronRight" className="text-slate-400" size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Прогресс выполнения</span>
                    <span className="font-semibold text-[#2563EB]">{work.progress}%</span>
                  </div>
                  <Progress value={work.progress} className="h-2" />
                  <p className="text-xs text-slate-500">Обновлено: {work.lastUpdate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.status === 'inProgress').map((work) => (
            <Card key={work.id} className="cursor-pointer hover-scale" onClick={() => navigate(`/my-works/${work.id}`)}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{work.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{work.object}</p>
                <Progress value={work.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.status === 'review').map((work) => (
            <Card key={work.id} className="cursor-pointer hover-scale" onClick={() => navigate(`/my-works/${work.id}`)}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{work.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{work.object}</p>
                <Progress value={work.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="defects" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.defectsCount > 0).map((work) => (
            <Card key={work.id} className="border-red-200 cursor-pointer hover-scale" onClick={() => navigate(`/my-works/${work.id}`)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{work.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{work.object}</p>
                  </div>
                  <Badge variant="destructive">{work.defectsCount}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyWorks;
