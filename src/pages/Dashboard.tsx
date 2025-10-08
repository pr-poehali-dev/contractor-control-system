import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: 'Всего проектов', value: '3', subtext: 'активных', icon: 'Building2', color: 'bg-blue-100 text-[#2563EB]' },
    { label: 'Объектов', value: '25', subtext: 'в работе', icon: 'MapPin', color: 'bg-green-100 text-green-600' },
    { label: 'Работ', value: '107', subtext: 'контролируется', icon: 'ClipboardCheck', color: 'bg-purple-100 text-purple-600' },
    { label: 'Замечания', value: '8', subtext: 'требуют внимания', icon: 'AlertCircle', color: 'bg-red-100 text-red-600' },
  ];

  const recentProjects = [
    { id: '1', name: 'Капремонт Казани 2025', progress: 67, objects: 12, works: 48 },
    { id: '2', name: 'Благоустройство дворов', progress: 34, objects: 8, works: 24 },
    { id: '3', name: 'Реконструкция школ', progress: 12, objects: 5, works: 35 },
  ];

  if (user?.role === 'contractor') {
    navigate('/objects');
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Главная</h1>
        <p className="text-slate-600">Обзор всех проектов</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-4 md:p-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center mb-2 md:mb-3`}>
                <Icon name={stat.icon as any} size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Проекты</h2>
        <Button onClick={() => navigate('/projects')} variant="ghost" size="sm">
          Все проекты
          <Icon name="ArrowRight" size={16} className="ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {recentProjects.map((project, index) => (
          <Card 
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">{project.name}</CardTitle>
              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <Icon name="Building" size={14} />
                  {project.objects}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Wrench" size={14} />
                  {project.works}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Прогресс</span>
                  <span className="font-semibold text-blue-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;