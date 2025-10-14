import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  client_organization?: string;
}

const PublicObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [object, setObject] = useState<BuildingObject | null>(null);
  const [works, setWorks] = useState<Work[]>([]);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'active': { label: 'Активный', variant: 'default' },
      'completed': { label: 'Завершён', variant: 'secondary' },
      'pending': { label: 'В ожидании', variant: 'outline' }
    };
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад к профилю
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
              <Icon name="Building2" size={40} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{object.title}</h1>
                <Badge variant={getStatusBadge(object.status).variant}>
                  {getStatusBadge(object.status).label}
                </Badge>
              </div>
              {object.address && (
                <p className="text-slate-600 mb-2 flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  {object.address}
                </p>
              )}
              {object.description && (
                <p className="text-slate-700 mb-3">{object.description}</p>
              )}
              {object.client_organization && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Icon name="Users" size={16} />
                  {object.client_organization}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Работы на объекте</h2>
          <p className="text-slate-600">Список всех работ выполняемых на данном объекте</p>
        </div>

        {works.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Briefcase" size={64} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">На объекте пока нет работ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => (
              <Card key={work.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-slate-900">{work.title}</h3>
                      <Badge variant={getStatusBadge(work.status).variant}>
                        {getStatusBadge(work.status).label}
                      </Badge>
                    </div>
                    {work.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{work.description}</p>
                    )}
                  </div>

                  {work.contractor_name && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <Icon name="Users" size={16} />
                      <span className="truncate">{work.contractor_name}</span>
                    </div>
                  )}

                  {(work.start_date || work.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <Icon name="Calendar" size={16} />
                      <span>
                        {work.start_date && new Date(work.start_date).toLocaleDateString('ru-RU')}
                        {work.start_date && work.end_date && ' - '}
                        {work.end_date && new Date(work.end_date).toLocaleDateString('ru-RU')}
                      </span>
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

export default PublicObject;