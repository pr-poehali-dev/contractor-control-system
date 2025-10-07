import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Dashboard = () => {
  const navigate = useNavigate();

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Дашборд</h1>
        <p className="text-slate-600">Обзор всех проектов и активностей</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon name={stat.icon as any} size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-4">Последние проекты</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentProjects.map((project, index) => (
          <Card 
            key={project.id}
            className="cursor-pointer hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <Icon name="Building" size={16} />
                  {project.objects} объектов
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Wrench" size={16} />
                  {project.works} работ
                </span>
              </div>
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
    </div>
  );
};

export default Dashboard;
