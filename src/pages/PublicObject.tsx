import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

type TabType = 'journal' | 'schedule' | 'analytics' | 'inspections' | 'info';

const PublicObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [object, setObject] = useState<BuildingObject | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('info');

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
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Building2" size={64} className="text-slate-400 mx-auto mb-4" />
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

  const tabs = [
    { id: 'journal' as TabType, label: 'Журнал работ' },
    { id: 'schedule' as TabType, label: 'График' },
    { id: 'analytics' as TabType, label: 'Аналитика' },
    { id: 'inspections' as TabType, label: 'Проверки' },
    { id: 'info' as TabType, label: 'Общая информация' },
  ];

  return (
    <div className="min-h-screen bg-slate-200 pb-20">
      <div className="bg-slate-200 pt-8 pb-6">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
              className="w-12 h-12 rounded-full bg-white hover:bg-slate-100"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="w-12 h-12 rounded-full bg-white hover:bg-slate-100"
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-32 rounded-full bg-rose-300 mb-6" />
            <h1 className="text-2xl font-semibold text-slate-900 mb-6">{object.title}</h1>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-400 text-white'
                      : 'bg-slate-300 text-slate-700 hover:bg-slate-350'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Даты</h2>
              <div className="space-y-3">
                <Card className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Дата старта работ</span>
                    <span className="text-slate-900 font-medium">
                      {object.created_at ? formatDate(object.created_at) : '—'}
                    </span>
                  </div>
                </Card>
                <Card className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Дата заключения договора</span>
                    <span className="text-slate-900 font-medium">
                      {object.updated_at ? formatDate(object.updated_at) : '—'}
                    </span>
                  </div>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Характеристики</h2>
              <div className="space-y-3">
                {object.address && (
                  <Card className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Адрес</span>
                      <span className="text-slate-900 font-medium text-right">{object.address}</span>
                    </div>
                  </Card>
                )}
                {object.description && (
                  <Card className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Описание</span>
                      <span className="text-slate-900 font-medium text-right">{object.description}</span>
                    </div>
                  </Card>
                )}
                <Card className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Проект</span>
                    <button className="text-blue-600 font-medium hover:underline">
                      Скачать
                    </button>
                  </div>
                </Card>
                <Card className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Разрешительная документация</span>
                    <button className="text-blue-600 font-medium hover:underline">
                      Скачать
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Журнал работ</h2>
            {works.length === 0 ? (
              <Card className="p-8 bg-white text-center">
                <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Нет работ в журнале</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {works.map((work) => (
                  <Card key={work.id} className="p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                    {work.description && (
                      <p className="text-sm text-slate-600 mb-2">{work.description}</p>
                    )}
                    {work.contractor_name && (
                      <p className="text-sm text-slate-500">Подрядчик: {work.contractor_name}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">График работ</h2>
            <Card className="p-8 bg-white text-center">
              <Icon name="Calendar" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Раздел в разработке</p>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Аналитика</h2>
            <Card className="p-8 bg-white text-center">
              <Icon name="BarChart3" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Раздел в разработке</p>
            </Card>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Проверки</h2>
            <Card className="p-8 bg-white text-center">
              <Icon name="ClipboardCheck" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Раздел в разработке</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicObject;
