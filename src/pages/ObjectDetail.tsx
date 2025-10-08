import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import WorkJournal from '@/components/WorkJournal';

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const projects = userData?.projects || [];

  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));
  const siteWorks = works.filter(w => w.object_id === Number(objectId));

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
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
        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            {site.address}
          </span>
          <span>•</span>
          <span>{project?.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Работ на объекте</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{siteWorks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {siteWorks.filter(w => w.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {siteWorks.filter(w => w.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Журнал работ</h2>
        <Button 
          onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}
          data-tour="create-work-btn"
        >
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить работу
        </Button>
      </div>

      <WorkJournal objectId={Number(objectId)} />
    </div>
  );
};

export default ObjectDetail;
