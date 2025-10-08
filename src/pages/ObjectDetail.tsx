import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const workLogs = userData?.workLogs || [];
  const remarks = userData?.remarks || [];

  const site = sites.find(s => s.id === Number(objectId));
  
  if (!site) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}`)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К проекту
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Объект не найден</p>
        </div>
      </div>
    );
  }

  const siteWorks = works.filter(w => w.object_id === site.id);

  const worksWithStats = siteWorks.map(work => {
    const workEntries = workLogs.filter(log => log.work_id === work.id);
    const lastEntry = workEntries[0];
    
    return {
      ...work,
      entriesCount: workEntries.length,
      lastEntry: lastEntry?.description || 'Нет записей',
      lastEntryDate: lastEntry?.created_at,
    };
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'В работе';
      case 'pending': return 'Ожидание';
      case 'completed': return 'Завершено';
      case 'on_hold': return 'Приостановлено';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'on_hold': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <div className="bg-white border-b border-slate-200 p-4 md:p-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К проекту
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{site.title}</h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            {site.address}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Badge className={getStatusColor(site.status)}>
            {getStatusLabel(site.status)}
          </Badge>
          <span className="text-sm text-slate-600">
            {siteWorks.length} {siteWorks.length === 1 ? 'работа' : 'работ'}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Работы</h2>
          <Button 
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}
            size="sm"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            <span className="hidden md:inline">Добавить работу</span>
            <span className="md:hidden">Работа</span>
          </Button>
        </div>

        {siteWorks.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <Icon name="Wrench" size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Нет работ на объекте</p>
            <Button onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить первую работу
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {worksWithStats.map((work, index) => (
              <Card
                key={work.id}
                className="cursor-pointer hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/${work.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg mb-2">{work.title}</CardTitle>
                      {work.contractor_name && (
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Icon name="User" size={14} />
                          {work.contractor_name}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(work.status)}>
                      {getStatusLabel(work.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {work.description && (
                    <p className="text-sm text-slate-600 mb-3">{work.description}</p>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Icon name="FileText" size={14} />
                      {work.entriesCount} {work.entriesCount === 1 ? 'запись' : 'записей'}
                    </span>
                    {work.start_date && (
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        Начало: {new Date(work.start_date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>

                  {work.lastEntry && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Последняя запись:</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{work.lastEntry}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetail;
