import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Work {
  id: number;
  title: string;
  description: string;
  object_id: number;
  status: string;
  contractor_name?: string;
  start_date?: string;
  end_date?: string;
}

interface BuildingObject {
  id: number;
  title: string;
  address?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const PublicObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [object, setObject] = useState<BuildingObject | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (userData?.objects && objectId) {
      const foundObject = userData.objects.find((obj: BuildingObject) => obj.id === Number(objectId));
      setObject(foundObject || null);
      
      if (userData.works) {
        const objectWorks = userData.works.filter((work: Work) => 
          work.object_id === Number(objectId)
        );
        setWorks(objectWorks);
      }
    }
  }, [userData, objectId]);

  if (!object) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Building2" size={64} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Объект не найден</h2>
          <Button onClick={() => navigate('/profile')} variant="outline" className="mt-4">
            Вернуться к профилю
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-4 flex items-center justify-center">
              <Icon name="Building2" size={40} className="text-blue-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">{object.title}</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="h-auto bg-white p-0 w-full sticky top-0 z-10 pb-3 pt-1 shadow-sm">
            <div className="space-y-2 w-full">
              <div className="grid grid-cols-3 gap-2">
                <TabsTrigger 
                  value="journal" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs md:text-sm py-2"
                >
                  Журнал работ
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs md:text-sm py-2"
                >
                  График
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs md:text-sm py-2"
                >
                  Аналитика
                </TabsTrigger>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TabsTrigger 
                  value="inspections"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs md:text-sm py-2"
                >
                  Проверки
                </TabsTrigger>
                <TabsTrigger 
                  value="info"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs md:text-sm py-2"
                >
                  Общая информация
                </TabsTrigger>
              </div>
            </div>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Даты</h2>
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <span className="text-slate-600 text-sm md:text-base">Дата старта работ</span>
                      <span className="text-slate-900 font-medium text-sm md:text-base">
                        {object.created_at ? formatDate(object.created_at) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <span className="text-slate-600 text-sm md:text-base">Дата заключения договора</span>
                      <span className="text-slate-900 font-medium text-sm md:text-base">
                        {object.updated_at ? formatDate(object.updated_at) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Характеристики</h2>
              <div className="space-y-3">
                {object.address && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span className="text-slate-600 text-sm md:text-base">Адрес</span>
                        <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                          {object.address}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {object.description && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span className="text-slate-600 text-sm md:text-base">Описание</span>
                        <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                          {object.description}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm md:text-base">Проект</span>
                      <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                        Скачать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm md:text-base">Разрешительная документация</span>
                      <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                        Скачать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="journal" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Журнал работ</h2>
            {works.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Нет работ в журнале</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {works.map((work) => (
                  <Card key={work.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-sm text-slate-600 mb-2">{work.description}</p>
                      )}
                      {work.contractor_name && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Icon name="Users" size={14} />
                          {work.contractor_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-slate-900">График работ</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="Calendar" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Раздел в разработке</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Аналитика</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="BarChart3" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Раздел в разработке</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Проверки</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="ClipboardCheck" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Раздел в разработке</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicObject;