import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PublicObject = () => {
  const { projectId, objectId } = useParams();
  const { userData } = useAuth();

  const site = userData?.sites?.find(s => s.id === Number(objectId));
  const project = userData?.projects?.find(p => p.id === Number(projectId));
  const objectWorks = userData?.works?.filter(w => w.object_id === Number(objectId)) || [];
  const inspections = userData?.inspections?.filter(i => objectWorks.some(w => w.id === i.work_id)) || [];

  if (!site || !project) {
    return (
      <div className="container max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Объект не найден</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-4xl mx-auto px-3 py-3 md:px-8 md:py-8 pb-24 md:pb-10">
        <Card className="mb-4 md:mb-8">
          <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
            <div className="flex flex-col items-center text-center mb-3 md:mb-6">
              <div className="flex h-14 w-14 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-2 md:mb-4">
                <Icon name="Building2" size={28} className="text-slate-600 md:hidden" />
                <Icon name="Building2" size={48} className="text-slate-600 hidden md:block" />
              </div>
              <h1 className="text-base md:text-3xl font-bold text-slate-900 mb-1 md:mb-2 px-2">{site.title}</h1>
              <p className="text-xs md:text-base text-slate-600 mb-2 md:mb-3 px-2">{site.address}</p>
              <Badge variant={site.status === 'active' ? 'default' : 'secondary'} className="text-[10px] md:text-sm px-2 py-0.5">
                {site.status === 'active' ? 'Активный' : 'Завершён'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-8">
              <div className="text-center px-1">
                <div className="text-lg md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1">{objectWorks.length}</div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">работ</p>
              </div>
              <div className="text-center px-1">
                <div className="text-lg md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1">{inspections.length}</div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">проверок</p>
              </div>
              <div className="text-center px-1">
                <div className="text-xs md:text-4xl font-bold text-slate-900 mb-0.5 md:mb-1 leading-tight">
                  {new Date(site.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
                <p className="text-[9px] md:text-sm text-slate-600 leading-tight">дата создания</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="journal" className="space-y-3 md:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-9 md:h-10">
            <TabsTrigger value="journal" className="text-xs md:text-sm px-1 md:px-4">Журнал</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs md:text-sm px-1 md:px-4">График</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm px-1 md:px-4">Аналитика</TabsTrigger>
            <TabsTrigger value="inspections" className="text-xs md:text-sm px-1 md:px-4">Проверки</TabsTrigger>
            <TabsTrigger value="general" className="text-xs md:text-sm px-1 md:px-4">Общее</TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-2 md:space-y-4">
            <Card>
              <CardContent className="p-3 md:p-6">
                <h3 className="text-xs md:text-base font-semibold text-slate-900 mb-2 md:mb-4">Журнал работ</h3>
                <div className="space-y-3">
                  {objectWorks.map(work => (
                    <div key={work.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-900">{work.title}</h4>
                        <Badge variant={work.status === 'active' ? 'default' : 'secondary'}>
                          {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Завершено' : 'Ожидание'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{work.description}</p>
                      {work.contractor_name && (
                        <p className="text-xs text-slate-500 mt-2">{work.contractor_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">График работ</h3>
                <div className="text-center py-12">
                  <Icon name="Calendar" size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">График работ в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Аналитика</h3>
                <div className="text-center py-12">
                  <Icon name="BarChart3" size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Аналитика в разработке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Проверки</h3>
                <div className="space-y-3">
                  {inspections.map(inspection => (
                    <div key={inspection.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-900">{inspection.inspection_number}</h4>
                        <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
                          {inspection.status === 'completed' ? 'Завершена' : inspection.status === 'draft' ? 'Черновик' : 'В процессе'}
                        </Badge>
                      </div>
                      {inspection.description && (
                        <p className="text-sm text-slate-600">{inspection.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Даты</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Дата создания</span>
                    <span className="font-medium">{new Date(site.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Последнее обновление</span>
                    <span className="font-medium">{new Date(site.updated_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Характеристики</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Проект</span>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Разрешительная документация</span>
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

export default PublicObject;