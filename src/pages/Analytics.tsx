import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Analytics = () => {
  const projectsData = [
    { name: 'Капремонт Казани 2025', plan: 100, fact: 67, budget: 15000000, spent: 10050000 },
    { name: 'Благоустройство дворов', plan: 100, fact: 34, budget: 8000000, spent: 2720000 },
    { name: 'Реконструкция школ', plan: 100, fact: 12, budget: 25000000, spent: 3000000 },
  ];

  const worksData = [
    { work: 'Замена кровли', progress: 80, planned: 2200000, actual: 1980000, deviation: -10 },
    { work: 'Ремонт фасада', progress: 100, planned: 1500000, actual: 1650000, deviation: 10 },
    { work: 'Замена окон', progress: 100, planned: 850000, actual: 820000, deviation: -3.5 },
    { work: 'Ремонт подъездов', progress: 45, planned: 650000, actual: 350000, deviation: -46 },
  ];

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
            <p className="text-3xl font-bold text-[#2563EB]">43%</p>
            <p className="text-xs text-slate-500 mt-1">По всем проектам</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Бюджет</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">48M ₽</p>
            <p className="text-xs text-slate-500 mt-1">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Освоено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">15.77M ₽</p>
            <p className="text-xs text-slate-500 mt-1">33% от бюджета</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Экономия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">-240K ₽</p>
            <p className="text-xs text-slate-500 mt-1">-1.5% от плана</p>
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
