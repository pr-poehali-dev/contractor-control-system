import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch } from '@/store/hooks';
import { deleteObject } from '@/store/slices/objectsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getWorkStatusInfo, formatDateRange } from '@/utils/workStatus';
import { NotificationGroup } from '@/components/ui/notification-badge';
import ObjectInfoBar from '@/components/objects/ObjectInfoBar';

const ObjectDetail = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { user, userData, loadUserData } = useAuthRedux();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [showActions, setShowActions] = useState(false);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const unreadCounts = userData?.unreadCounts || {};
  const isContractor = user?.role === 'contractor';
  
  const object = objects.find(s => s.id === Number(objectId));
  let objectWorks = object?.works || [];

  // Фильтрация по статусу
  if (statusFilter !== 'all') {
    objectWorks = objectWorks.filter(w => {
      const statusInfo = getWorkStatusInfo(w);
      return statusInfo.status === statusFilter;
    });
  }

  // Сортировка
  if (sortBy === 'priority') {
    objectWorks = [...objectWorks].sort((a, b) => {
      const statusA = getWorkStatusInfo(a);
      const statusB = getWorkStatusInfo(b);
      const priorityOrder = { 
        awaiting_start: 0, 
        delayed: 1, 
        active: 2, 
        awaiting_acceptance: 3, 
        completed: 4, 
        planned: 5 
      };
      return (priorityOrder[statusA.status] || 99) - (priorityOrder[statusB.status] || 99);
    });
  } else if (sortBy === 'name') {
    objectWorks = [...objectWorks].sort((a, b) => a.title.localeCompare(b.title));
  }

  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    if (!hasRedirected && objectWorks.length > 0 && window.innerWidth >= 768) {
      setHasRedirected(true);
      navigate(`/objects/${objectId}/works/${objectWorks[0].id}`, { replace: true });
    }
  }, [objectWorks.length, objectId, navigate, hasRedirected]);
  
  if (!hasRedirected && objectWorks.length > 0 && window.innerWidth >= 768) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/objects')}>
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
    navigate(`/objects/${objectId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return;
    if (!user || !object) return;
    
    try {
      await dispatch(deleteObject(object.id)).unwrap();
      await loadUserData();
      toast({ title: 'Объект удалён' });
      navigate('/objects');
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
      {/* Mobile: хедер */}
      <div className="md:hidden sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
        <div className="mb-3">
          <ObjectInfoBar 
            object={object} 
            compact 
            onBack={() => navigate('/objects')}
            onSettings={() => navigate(`/objects/${objectId}/works/create`)}
          />
        </div>

        <div className="space-y-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Все работы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все работы</SelectItem>
              <SelectItem value="planned">Плановые</SelectItem>
              <SelectItem value="awaiting_start">Требуется подтверждение</SelectItem>
              <SelectItem value="active">В процессе</SelectItem>
              <SelectItem value="awaiting_acceptance">Готово к приемке</SelectItem>
              <SelectItem value="delayed">С задержкой</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="По приоритету" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">По приоритету</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>



      <div className="md:hidden pb-24">
        {objectWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 px-4">
            <Icon name="Briefcase" size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Пока нет работ
            </h3>
            <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
              Создайте первую работу для этого объекта
            </p>
            <Button onClick={() => navigate(`/objects/${objectId}/works/create`)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать работу
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {objectWorks.map((work) => (
                <div
                  key={work.id}
                  className="bg-white p-4 active:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/objects/${objectId}/works/${work.id}`)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon name="Wrench" size={18} className="text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-slate-900 mb-1 line-clamp-2">{work.title}</h3>
                      
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge 
                          variant="outline"
                          className={`text-xs ${getWorkStatusInfo(work).color}`}
                        >
                          {getWorkStatusInfo(work).icon} {getWorkStatusInfo(work).message}
                        </Badge>
                        
                        {work.planned_start_date && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Icon name="Calendar" size={11} />
                            {formatDateRange(work.planned_start_date, work.planned_end_date)}
                          </span>
                        )}
                      </div>
                      
                      <NotificationGroup
                        messages={unreadCounts[work.id]?.messages}
                        logs={!isContractor ? unreadCounts[work.id]?.logs : undefined}
                        inspections={isContractor ? unreadCounts[work.id]?.inspections : undefined}
                        size="xs"
                        className="mb-2"
                      />

                      {work.contractor_name && (
                        <p className="text-sm text-slate-500">
                          {work.contractor_name}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex items-center">
                      <Icon name="ChevronRight" size={20} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hidden md:block p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Работы</h2>
            <p className="text-sm text-slate-500 mt-1">
              {object.title} • {objectWorks.length} {objectWorks.length === 1 ? 'работа' : objectWorks.length < 5 ? 'работы' : 'работ'}
            </p>
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {objectWorks.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="Briefcase" size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Пока нет работ
                </h3>
                <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
                  Создайте первую работу для этого объекта, чтобы начать отслеживать прогресс
                </p>
                <Button onClick={() => navigate(`/objects/${objectId}/works/create`)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать работу
                </Button>
              </CardContent>
            </Card>
          ) : (
            objectWorks.map((work) => (
              <Card 
                key={work.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/objects/${objectId}/works/${work.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    <Badge variant={work.status === 'completed' ? 'default' : 'secondary'}>
                      {work.status === 'active' && 'В работе'}
                      {work.status === 'pending' && 'Ожидание'}
                      {work.status === 'completed' && 'Завершено'}
                      {work.status === 'on_hold' && 'Приостановлено'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {work.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {work.description}
                    </p>
                  )}
                  {work.contractor_name && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Icon name="User" size={14} className="mr-1" />
                      {work.contractor_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {(user?.role === 'client' || user?.role === 'admin') && objectWorks.length > 0 && (
            <button
              onClick={() => navigate(`/objects/${objectId}/works/create`)}
              className="h-full min-h-[180px] p-6 bg-white border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-600"
            >
              <Icon name="Plus" size={32} />
            </button>
          )}
        </div>
      </div>


    </div>
  );
};

export default ObjectDetail;