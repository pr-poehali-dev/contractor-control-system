import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProjectObject {
  id: string;
  address: string;
  worksCount: number;
  totalProgress: number;
  defectsCount: number;
}

const mockObjects: ProjectObject[] = [
  {
    id: '1-1',
    address: 'ул. Ленина, д. 10',
    worksCount: 3,
    totalProgress: 75,
    defectsCount: 2,
  },
  {
    id: '1-2',
    address: 'ул. Пушкина, д. 5',
    worksCount: 2,
    totalProgress: 45,
    defectsCount: 6,
  },
  {
    id: '1-3',
    address: 'пр. Победы, д. 15',
    worksCount: 4,
    totalProgress: 90,
    defectsCount: 0,
  },
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/projects')}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К списку проектов
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Капремонт Казани 2025</h1>
        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-2">
            <Icon name="Building" size={18} />
            12 объектов
          </span>
          <span className="flex items-center gap-2">
            <Icon name="Wrench" size={18} />
            48 работ
          </span>
          <Badge>Активен</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Общий прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">67%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Объектов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">48</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Замечания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">8</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-4">Объекты</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockObjects.map((obj, index) => (
          <Card 
            key={obj.id}
            className="cursor-pointer hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/projects/${projectId}/objects/${obj.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon name="MapPin" className="text-slate-600" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{obj.address}</CardTitle>
                    <CardDescription>{obj.worksCount} работ</CardDescription>
                  </div>
                </div>
                {obj.defectsCount > 0 && (
                  <Badge variant="destructive">{obj.defectsCount} замечаний</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Прогресс</span>
                  <span className="font-semibold text-[#2563EB]">{obj.totalProgress}%</span>
                </div>
                <Progress value={obj.totalProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetail;
