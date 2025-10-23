import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Work, BuildingObject } from '@/components/public-object/types';
import ObjectHeader from '@/components/public-object/ObjectHeader';
import TabNavigation from '@/components/public-object/TabNavigation';
import InfoTab from '@/components/public-object/InfoTab';
import JournalTab from '@/components/public-object/JournalTab';
import ScheduleTab from '@/components/public-object/ScheduleTab';
import AnalyticsTab from '@/components/public-object/AnalyticsTab';
import InspectionsTab from '@/components/public-object/InspectionsTab';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const PublicObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { userData, token, loadUserData } = useAuthRedux();
  const { toast } = useToast();
  const [object, setObject] = useState<BuildingObject | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState('journal');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshData = async () => {
    if (!token) return;
    
    setIsRefreshing(true);
    try {
      await loadUserData();
      toast({
        title: 'Данные обновлены',
        description: 'График работ обновлён',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <ObjectHeader object={object} onBack={handleBack} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {activeTab === 'info' && <InfoTab object={object} formatDate={formatDate} />}
          {activeTab === 'journal' && <JournalTab objectId={Number(objectId)} />}
          {activeTab === 'schedule' && (
            <ScheduleTab 
              works={works} 
              onRefresh={handleRefreshData}
              isRefreshing={isRefreshing}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsTab objectId={Number(objectId)} />}
          {activeTab === 'inspections' && <InspectionsTab objectId={Number(objectId)} />}
        </div>
      </div>
    </div>
  );
};

export default PublicObject;