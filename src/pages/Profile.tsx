import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getRoleLabel = (role?: string): string => {
  if (role === 'admin') return 'Администратор';
  if (role === 'client') return 'Заказчик';
  return 'Подрядчик';
};

const getRatingData = (role?: string, reliabilityRating: number = 0, qualityRating: number = 0) => {
  const isClient = role === 'client';
  return {
    primary: {
      value: isClient ? reliabilityRating : qualityRating,
      label: isClient ? 'Рейтинг надежности' : 'Качество работ'
    },
    secondary: {
      value: isClient ? qualityRating : reliabilityRating,
      label: isClient ? 'Качество работ' : 'Рейтинг надежности'
    }
  };
};

const Profile = () => {
  const { user, userData, logout } = useAuthRedux();
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

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  const userObjects = user?.role === 'contractor'
    ? objects.filter(obj => works.some(w => w.object_id === obj.id))
    : objects;

  const userInspections = user?.role === 'client' ? inspections : [];

  const daysInSystem = 345;
  const reliabilityRating = Math.floor((userObjects.filter(o => o.status === 'completed').length / Math.max(userObjects.length, 1)) * 100);
  const qualityRating = Math.floor((userInspections.filter(i => i.status === 'completed').length / Math.max(userInspections.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-10">
        <Card className="mb-8">
          <CardContent className="pt-6 relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
              className="absolute top-6 right-6 h-10 w-10 rounded-full"
            >
              <Icon name="Settings" size={20} />
            </Button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-3xl mb-4">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{user?.name}</h1>
              {user?.role === 'contractor' && user?.organization && (
                <p className="text-slate-600 mb-3">{user.organization}</p>
              )}
              <Badge variant="outline" className="mb-4">
                {getRoleLabel(user?.role)}
              </Badge>
            </div>

            {user?.role === 'admin' ? (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  onClick={() => navigate('/admin')}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="Shield" size={20} />
                  <span className="text-xs">Админ-панель</span>
                </Button>
                <Button 
                  onClick={() => navigate('/work-types')}
                  className="h-16 flex flex-col items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Icon name="BookOpen" size={20} />
                  <span className="text-xs">Справочники</span>
                </Button>
              </div>
            ) : user?.role === 'contractor' ? (
              <>
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      {getRatingData(user?.role, reliabilityRating, qualityRating).primary.value}%
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">
                      {getRatingData(user?.role, reliabilityRating, qualityRating).primary.label}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                      {getRatingData(user?.role, reliabilityRating, qualityRating).secondary.value}%
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">
                      {getRatingData(user?.role, reliabilityRating, qualityRating).secondary.label}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{daysInSystem}</div>
                    <p className="text-xs md:text-sm text-slate-600">дней в системе</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/organization')}
                  variant="outline"
                  className="w-full mt-6"
                >
                  <Icon name="Building" size={18} className="mr-2" />
                  Моя организация
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                    {getRatingData(user?.role, reliabilityRating, qualityRating).primary.value}%
                  </div>
                  <p className="text-xs md:text-sm text-slate-600">
                    {getRatingData(user?.role, reliabilityRating, qualityRating).primary.label}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                    {getRatingData(user?.role, reliabilityRating, qualityRating).secondary.value}%
                  </div>
                  <p className="text-xs md:text-sm text-slate-600">
                    {getRatingData(user?.role, reliabilityRating, qualityRating).secondary.label}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{daysInSystem}</div>
                  <p className="text-xs md:text-sm text-slate-600">дней в системе</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {user?.role !== 'admin' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full ${user?.role === 'client' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="objects" className="text-xs md:text-sm">Мои объекты</TabsTrigger>
              {user?.role === 'client' && (
                <TabsTrigger value="inspections" className="text-xs md:text-sm">Мои проверки</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="objects" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userObjects.map((obj) => (
                <Card key={obj.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/public/objects/${obj.id}`)}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                      <Icon name="Building2" size={48} className="text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{obj.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{obj.address || 'Адрес не указан'}</p>
                    <Badge variant={obj.status === 'active' ? 'default' : 'secondary'}>
                      {obj.status === 'active' ? 'Активный' : 'Завершён'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {userObjects.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Building2" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Нет объектов</p>
              </div>
            )}
          </TabsContent>



          {user?.role === 'client' && (
            <TabsContent value="inspections" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInspections.map((inspection) => (
                  <Card key={inspection.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                    sessionStorage.setItem('inspectionFromPage', '/profile');
                    navigate(`/inspection/${inspection.id}`);
                  }}>
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
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Profile;