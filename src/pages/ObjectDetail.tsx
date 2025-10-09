import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import WorkJournal from '@/components/WorkJournal';
import { useToast } from '@/hooks/use-toast';

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const projects = userData?.projects || [];

  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));
  const siteWorks = works.filter(w => w.object_id === Number(objectId));

  if (!site) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Объект не найден</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    toast({ title: 'Редактирование объекта', description: 'Функция в разработке' });
  };

  const handleDelete = async () => {
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return;
    try {
      await api.deleteItem(user!.id, 'object', site.id);
      const refreshed = await api.getUserData(user!.id);
      setUserData(refreshed);
      localStorage.setItem('userData', JSON.stringify(refreshed));
      toast({ title: 'Объект удалён' });
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: error instanceof Error ? error.message : 'Не удалось удалить',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Хедер */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-6 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex-shrink-0 mt-0.5"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <Icon name="ChevronLeft" size={24} />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{site.title}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon name="MapPin" size={16} />
                <span className="truncate">{site.address}</span>
              </div>
            </div>
          </div>
          
          {(user?.role === 'client' || user?.role === 'admin') && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowActions(!showActions)}
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          )}
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
              <Icon name="Edit" size={18} className="mr-1" />
              Изменить
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDelete}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}
      </div>

      {/* Журнал работ */}
      <WorkJournal objectId={Number(objectId)} />
    </div>
  );
};

export default ObjectDetail;