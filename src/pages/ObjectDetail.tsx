import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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

const mockWorks: Work[] = [
  { 
    id: 'w1', 
    name: 'Замена кровли', 
    contractor: 'ООО "СтройМастер"', 
    status: 'inProgress', 
    progress: 80, 
    defectsCount: 2, 
    lastCheck: '2025-10-05' 
  },
  { 
    id: 'w2', 
    name: 'Ремонт фасада', 
    contractor: 'ООО "СтройМастер"', 
    status: 'review', 
    progress: 100, 
    defectsCount: 0, 
    lastCheck: '2025-10-06' 
  },
  { 
    id: 'w3', 
    name: 'Замена окон', 
    contractor: 'ИП Иванов', 
    status: 'completed', 
    progress: 100, 
    defectsCount: 0, 
    lastCheck: '2025-09-28' 
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

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К объектам проекта
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ул. Ленина, д. 10</h1>
        <p className="text-slate-600">Капремонт Казани 2025</p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
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
              onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/${work.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">{work.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">Подрядчик: {work.contractor}</p>
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
                  <Icon name="ChevronRight" className="text-slate-400" size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Прогресс</span>
                    <span className="font-semibold text-[#2563EB]">{work.progress}%</span>
                  </div>
                  <Progress value={work.progress} className="h-2" />
                  <p className="text-xs text-slate-500 mt-2">Последняя проверка: {work.lastCheck}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.status === 'inProgress').map((work) => (
            <Card key={work.id} className="cursor-pointer hover-scale">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900">{work.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{work.contractor}</p>
                <Progress value={work.progress} className="h-2 mt-3" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.status === 'review').map((work) => (
            <Card key={work.id} className="cursor-pointer hover-scale">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900">{work.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{work.contractor}</p>
                <Progress value={work.progress} className="h-2 mt-3" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="defects" className="mt-6 space-y-4">
          {mockWorks.filter(w => w.defectsCount > 0).map((work) => (
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
    </div>
  );
};

export default ObjectDetail;
