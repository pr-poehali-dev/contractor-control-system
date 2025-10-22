import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsTabProps {
  objectId: number;
}

const AnalyticsTab = ({ objectId }: AnalyticsTabProps) => {
  const { userData } = useAuth();

  const works = (userData?.works && Array.isArray(userData.works)) 
    ? userData.works.filter(w => w.object_id === objectId) 
    : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  // Вычисляем аналитику
  const totalBudget = works.reduce((sum, w) => sum + (parseFloat(w.budget) || 0), 0);
  const totalSpent = works.reduce((sum, w) => sum + (parseFloat(w.actual_cost) || 0), 0);
  const avgProgress = works.length > 0 
    ? Math.round(works.reduce((sum, w) => sum + (parseFloat(w.progress) || 0), 0) / works.length)
    : 0;
  const economy = totalSpent - (totalBudget * avgProgress / 100);

  const objectInspections = inspections.filter(insp => {
    const work = works.find(w => w.id === insp.work_id);
    return work !== undefined;
  });

  const completedInspections = objectInspections.filter(i => i.status === 'completed').length;
  const activeInspections = objectInspections.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Аналитика объекта</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-slate-600">Прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{avgProgress}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-slate-600">Работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{works.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-slate-600">Проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedInspections}</p>
            <p className="text-xs text-slate-500 mt-1">Завершено</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-slate-600">На проверке</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{activeInspections}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Финансы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Бюджет</p>
              <p className="text-xl font-bold text-slate-900">
                {totalBudget >= 1000000 
                  ? `${(totalBudget / 1000000).toFixed(1)}M ₽` 
                  : `${(totalBudget / 1000).toFixed(0)}K ₽`}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Освоено</p>
              <p className="text-xl font-bold text-green-600">
                {totalSpent >= 1000000 
                  ? `${(totalSpent / 1000000).toFixed(2)}M ₽` 
                  : `${(totalSpent / 1000).toFixed(0)}K ₽`}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-slate-600">Освоение бюджета</span>
              <span className="font-semibold">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="h-3" />
          </div>

          <div className={`p-3 rounded-lg ${economy < 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs text-slate-600 mb-1">
              {economy < 0 ? 'Экономия' : 'Перерасход'}
            </p>
            <p className={`text-lg font-bold ${economy < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {economy >= 0 ? '+' : ''}{economy >= 1000000 
                ? `${(economy / 1000000).toFixed(2)}M ₽` 
                : `${(economy / 1000).toFixed(0)}K ₽`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Работы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {works.map((work) => {
              const progress = parseFloat(work.progress) || 0;
              return (
                <div key={work.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{work.title}</span>
                    <span className="text-sm font-semibold text-slate-700">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
            {works.length === 0 && (
              <div className="text-center py-8">
                <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Нет работ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;