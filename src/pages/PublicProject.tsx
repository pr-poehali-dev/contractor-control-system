import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PublicProject = () => {
  const { projectId } = useParams();
  const { userData } = useAuth();

  const project = userData?.projects?.find(p => p.id === Number(projectId));
  const projectSites = userData?.sites?.filter(s => s.project_id === Number(projectId)) || [];
  const projectWorks = userData?.works?.filter(w => projectSites.some(s => s.id === w.object_id)) || [];

  if (!project) {
    return (
      <div className="container max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Проект не найден</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-4xl mx-auto px-3 py-3 md:px-8 md:py-8 pb-24 md:pb-10">
        <Card className="mb-4 md:mb-8">
          <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
            <div className="flex flex-col items-center text-center mb-3 md:mb-6">
              <div className="flex h-14 w-14 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-2 md:mb-4">
                <Icon name="FolderKanban" size={28} className="text-purple-600 md:hidden" />
                <Icon name="FolderKanban" size={48} className="text-purple-600 hidden md:block" />
              </div>
              <h1 className="text-base md:text-3xl font-bold text-slate-900 mb-1 md:mb-2 px-2">{project.title}</h1>
              <p className="text-xs md:text-base text-slate-600 mb-2 md:mb-3 px-2">{project.description}</p>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px] md:text-sm px-2 py-0.5">
                {project.status === 'active' ? 'Активный' : project.status === 'completed' ? 'Завершён' : 'В ожидании'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-8">
              <div className="text-center px-1">
                <div className="text-lg md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1">{projectSites.length}</div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">объектов</p>
              </div>
              <div className="text-center px-1">
                <div className="text-lg md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1">{projectWorks.length}</div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">работ</p>
              </div>
              <div className="text-center px-1">
                <div className="text-xs md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1 leading-tight">
                  {new Date(project.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">дата создания</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="general" className="text-xs md:text-sm">Общая информация</TabsTrigger>
            <TabsTrigger value="objects" className="text-xs md:text-sm">Объекты</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs md:text-sm">Документы</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Даты</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Дата создания</span>
                    <span className="font-medium">{new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Последнее обновление</span>
                    <span className="font-medium">{new Date(project.updated_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Характеристики</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Статус проекта</span>
                    <Badge>{project.status === 'active' ? 'Активный' : 'Завершён'}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Количество объектов</span>
                    <span className="font-medium">{projectSites.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Всего работ</span>
                    <span className="font-medium">{projectWorks.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objects" className="space-y-4">
            <div className="grid gap-4">
              {projectSites.map((site) => (
                <Card key={site.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                        <Icon name="Building2" size={32} className="text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">{site.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{site.address}</p>
                        <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                          {site.status === 'active' ? 'Активный' : 'Завершён'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Документы</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Проект</span>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Разрешительная документация</span>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicProject;