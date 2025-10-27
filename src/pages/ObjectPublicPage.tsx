import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const ObjectPublicPage = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  
  const objects = useAppSelector((state) => state.objects.items);
  const works = useAppSelector((state) => state.works.items);
  
  const object = objects.find(obj => obj.id === Number(objectId));
  const objectWorks = works.filter(w => w.object_id === Number(objectId));

  if (!object) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Building2" size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Объект не найден</h2>
          <Button onClick={() => navigate('/objects')} variant="outline">
            <Icon name="ChevronLeft" size={16} className="mr-2" />
            К списку объектов
          </Button>
        </div>
      </div>
    );
  }

  // Статистика
  const totalWorks = objectWorks.length;
  const completedWorks = objectWorks.filter(w => w.status === 'completed').length;
  const activeWorks = objectWorks.filter(w => w.status === 'active').length;
  const averageProgress = objectWorks.length > 0
    ? Math.round(objectWorks.reduce((sum, w) => sum + (parseFloat(w.progress) || 0), 0) / objectWorks.length)
    : 0;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Активный', variant: 'default' },
      completed: { label: 'Завершен', variant: 'secondary' },
      on_hold: { label: 'Приостановлен', variant: 'outline' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Хедер */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/objects/${objectId}`)}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  {object.title}
                </h1>
                {object.status && getStatusBadge(object.status)}
              </div>
              {object.address && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Icon name="MapPin" size={14} />
                  <span>{object.address}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/objects/${objectId}/works/create`)}
                variant="ghost"
                size="icon"
                title="Настройки объекта"
              >
                <Icon name="Settings" size={20} />
              </Button>
              
              <Button
                onClick={() => navigate(`/objects/${objectId}`)}
                variant="outline"
              >
                К работам
                <Icon name="ChevronRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Всего работ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="Briefcase" size={20} className="text-blue-600" />
                <p className="text-2xl font-bold text-slate-900">{totalWorks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Активные</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="Play" size={20} className="text-green-600" />
                <p className="text-2xl font-bold text-slate-900">{activeWorks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Завершено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={20} className="text-blue-600" />
                <p className="text-2xl font-bold text-slate-900">{completedWorks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Средний прогресс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-purple-600" />
                <p className="text-2xl font-bold text-slate-900">{averageProgress}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Информация об объекте */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация об объекте
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {object.address && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Адрес</p>
                <div className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="text-slate-400 mt-0.5" />
                  <p className="text-slate-900">{object.address}</p>
                </div>
              </div>
            )}

            {object.description && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Описание</p>
                <p className="text-slate-700 whitespace-pre-line">{object.description}</p>
              </div>
            )}

            {!object.address && !object.description && (
              <p className="text-sm text-slate-500 italic">Информация об объекте не заполнена</p>
            )}
          </CardContent>
        </Card>

        {/* Прогресс работ */}
        {objectWorks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ListChecks" size={20} />
                Прогресс работ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectWorks.map((work) => (
                  <div key={work.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-slate-900 truncate">{work.title}</p>
                        {work.contractor_name && (
                          <p className="text-sm text-slate-600">{work.contractor_name}</p>
                        )}
                      </div>
                      <Badge variant="outline">{Math.round(parseFloat(work.progress) || 0)}%</Badge>
                    </div>
                    <Progress value={parseFloat(work.progress) || 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ObjectPublicPage;