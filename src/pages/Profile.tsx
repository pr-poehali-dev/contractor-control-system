import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('objects');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const projects = userData?.projects || [];
  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const inspections = userData?.inspections || [];

  const userProjects = user?.role === 'contractor' 
    ? projects.filter(p => works.some(w => sites.some(s => s.project_id === p.id && w.object_id === s.id)))
    : projects;

  const userSites = user?.role === 'contractor'
    ? sites.filter(s => works.some(w => w.object_id === s.id))
    : sites;

  const userWorks = works;
  const userInspections = user?.role === 'client' ? inspections : [];

  const daysInSystem = 345;
  const reliabilityRating = Math.floor((userProjects.filter(p => p.status === 'completed').length / Math.max(userProjects.length, 1)) * 100);
  const qualityRating = Math.floor((userInspections.filter(i => i.status === 'completed').length / Math.max(userInspections.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-10">
        <div className="flex justify-end gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-10 w-10 rounded-full"
          >
            <Icon name="Settings" size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="h-10 w-10 rounded-full text-red-600 hover:bg-red-50"
          >
            <Icon name="LogOut" size={20} />
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-3xl mb-4">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{user?.name}</h1>
              <p className="text-slate-600 mb-3">укажите информацию о себе</p>
              <Badge variant="outline" className="mb-4">
                {user?.role === 'admin' ? 'Администратор' : user?.role === 'client' ? 'Заказчик' : 'Подрядчик'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {user?.role === 'client' ? reliabilityRating : qualityRating}%
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  {user?.role === 'client' ? 'Рейтинг надежности' : 'Качество работ'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {user?.role === 'contractor' ? qualityRating : reliabilityRating}%
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  {user?.role === 'contractor' ? 'Рейтинг надежности' : 'Качество работ'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{daysInSystem}</div>
                <p className="text-xs md:text-sm text-slate-600">дней в системе</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="objects" className="text-xs md:text-sm">Мои объекты</TabsTrigger>
            <TabsTrigger value="works" className="text-xs md:text-sm">Мои работы</TabsTrigger>
            {user?.role === 'client' && (
              <TabsTrigger value="inspections" className="text-xs md:text-sm">Мои проверки</TabsTrigger>
            )}
            <TabsTrigger value="projects" className="text-xs md:text-sm">Проекты</TabsTrigger>
          </TabsList>

          <TabsContent value="objects" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSites.map((site) => (
                <Card key={site.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  const project = projects.find(p => p.id === site.project_id);
                  if (project) navigate(`/projects/${project.id}/objects/${site.id}`);
                }}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                      <Icon name="Building2" size={48} className="text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{site.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{site.address}</p>
                    <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                      {site.status === 'active' ? 'Активный' : 'Завершён'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {userSites.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Building2" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Нет объектов</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="works" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWorks.map((work) => {
                const site = sites.find(s => s.id === work.object_id);
                const project = site ? projects.find(p => p.id === site.project_id) : null;
                return (
                  <Card key={work.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                    if (project && site) navigate(`/projects/${project.id}/objects/${site.id}`, { state: { scrollToWork: work.id } });
                  }}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                        <Icon name="Wrench" size={48} className="text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{work.description}</p>
                      <Badge variant={work.status === 'active' ? 'default' : 'secondary'}>
                        {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Завершено' : 'Ожидание'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {userWorks.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Wrench" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Нет работ</p>
              </div>
            )}
          </TabsContent>

          {user?.role === 'client' && (
            <TabsContent value="inspections" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInspections.map((inspection) => (
                  <Card key={inspection.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/inspection/${inspection.id}`)}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
                        <Icon name="ClipboardCheck" size={48} className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{inspection.inspection_number}</h3>
                      <p className="text-sm text-slate-600 mb-2">{works.find(w => w.id === inspection.work_id)?.title}</p>
                      <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
                        {inspection.status === 'completed' ? 'Завершена' : inspection.status === 'draft' ? 'Черновик' : 'В процессе'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {userInspections.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="ClipboardCheck" size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Нет проверок</p>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-4">
              {userProjects.map((project) => {
                const projectSites = sites.filter(s => s.project_id === project.id);
                return (
                  <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/projects/${project.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex-shrink-0">
                          <Icon name="FolderKanban" size={32} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-slate-900">{project.title}</h3>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status === 'active' ? 'Активный' : project.status === 'completed' ? 'Завершён' : 'В ожидании'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Icon name="Building2" size={16} />
                              {projectSites.length} {projectSites.length === 1 ? 'объект' : 'объекта'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={16} />
                              {new Date(project.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {userProjects.length === 0 && (
              <div className="text-center py-12">
                <Icon name="FolderKanban" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Нет проектов</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;