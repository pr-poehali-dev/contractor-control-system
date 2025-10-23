import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuthRedux } from '@/hooks/useAuthRedux';

const Analytics = () => {
  const { userData } = useAuthRedux();

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  // Вычисляем данные по объектам
  const projectsData = objects.map(obj => {
    const objectWorks = works.filter(w => w.object_id === obj.id);
    const totalBudget = objectWorks.reduce((sum, w) => sum + (parseFloat(w.budget) || 0), 0);
    const totalSpent = objectWorks.reduce((sum, w) => sum + (parseFloat(w.actual_cost) || 0), 0);
    
    // Рассчитываем средний прогресс работ
    const avgProgress = objectWorks.length > 0 
      ? objectWorks.reduce((sum, w) => sum + (parseFloat(w.progress) || 0), 0) / objectWorks.length 
      : 0;

    return {
      name: obj.title,
      plan: 100,
      fact: Math.round(avgProgress),
      budget: totalBudget,
      spent: totalSpent,
    };
  });

  // Вычисляем общую аналитику
  const totalBudget = projectsData.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projectsData.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = projectsData.length > 0 
    ? Math.round(projectsData.reduce((sum, p) => sum + p.fact, 0) / projectsData.length)
    : 0;
  const economy = totalSpent - (totalBudget * avgProgress / 100);

  // Вычисляем данные по работам
  const worksData = works.map(work => {
    const planned = parseFloat(work.budget) || 0;
    const actual = parseFloat(work.actual_cost) || 0;
    const progress = parseFloat(work.progress) || 0;
    const deviation = planned > 0 ? ((actual - planned) / planned) * 100 : 0;

    return {
      work: work.title,
      progress: Math.round(progress),
      planned,
      actual,
      deviation,
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Аналитика</h1>
        <p className="text-slate-600">Анализ выполнения и финансовые отчёты</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Общий прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">{avgProgress}%</p>
            <p className="text-xs text-slate-500 mt-1">По всем проектам</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Бюджет</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {totalBudget >= 1000000 
                ? `${(totalBudget / 1000000).toFixed(1)}M ₽` 
                : `${(totalBudget / 1000).toFixed(0)}K ₽`}
            </p>
            <p className="text-xs text-slate-500 mt-1">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Освоено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {totalSpent >= 1000000 
                ? `${(totalSpent / 1000000).toFixed(2)}M ₽` 
                : `${(totalSpent / 1000).toFixed(0)}K ₽`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% от бюджета
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Экономия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${economy < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {economy >= 0 ? '+' : ''}{economy >= 1000000 
                ? `${(economy / 1000000).toFixed(2)}M ₽` 
                : `${(economy / 1000).toFixed(0)}K ₽`}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {totalBudget > 0 ? ((economy / totalBudget) * 100).toFixed(1) : 0}% от плана
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">По проектам</TabsTrigger>
          <TabsTrigger value="works">По работам</TabsTrigger>
          <TabsTrigger value="timeline">График</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6 space-y-4">
          {projectsData.map((project, index) => (
            <Card key={project.name} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                    <CardDescription>
                      Бюджет: {(project.budget / 1000000).toFixed(1)}M ₽ • Освоено: {(project.spent / 1000000).toFixed(2)}M ₽
                    </CardDescription>
                  </div>
                  <Badge variant={project.fact >= 50 ? 'default' : 'secondary'}>
                    {project.fact}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-slate-600">Выполнение работ</span>
                    <span className="font-semibold">{project.fact}%</span>
                  </div>
                  <Progress value={project.fact} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-slate-600">Освоение бюджета</span>
                    <span className="font-semibold">{Math.round((project.spent / project.budget) * 100)}%</span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">План</p>
                    <p className="font-semibold text-slate-900">{(project.budget / 1000000).toFixed(1)}M ₽</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Факт</p>
                    <p className="font-semibold text-[#2563EB]">{(project.spent / 1000000).toFixed(2)}M ₽</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Отклонение</p>
                    <p className="font-semibold text-green-600">
                      {((project.spent - (project.budget * project.fact / 100)) / 1000).toFixed(0)}K ₽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="works" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Анализ по видам работ</CardTitle>
              <CardDescription>Сравнение плана и факта</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {worksData.map((work, index) => (
                  <div key={work.work} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{work.work}</h3>
                        <p className="text-sm text-slate-600">
                          План: {(work.planned / 1000).toFixed(0)}K ₽ • Факт: {(work.actual / 1000).toFixed(0)}K ₽
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{work.progress}%</p>
                        <Badge 
                          variant={work.deviation < 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {work.deviation > 0 ? '+' : ''}{work.deviation.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={work.progress} className="h-2" />
                      <div 
                        className="absolute top-0 left-0 h-2 bg-slate-200 opacity-30 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>График выполнения</CardTitle>
              <CardDescription>Динамика прогресса по месяцам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь'].map((month, i) => {
                  const progress = Math.min((i + 1) * 10, 100);
                  return (
                    <div key={month} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{month} 2025</span>
                        <span className="text-sm font-semibold text-[#2563EB]">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;