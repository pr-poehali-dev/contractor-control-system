import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const WorkDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К работам объекта
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Замена кровли</h1>
        <p className="text-slate-600 mb-3">ул. Ленина, д. 10 • Капремонт Казани 2025</p>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-base py-1.5 px-3">В работе</Badge>
          <Badge variant="destructive" className="text-base py-1.5 px-3">
            <Icon name="AlertTriangle" size={16} className="mr-1" />
            2 замечания
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Подрядчик</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">ООО "СтройМастер"</p>
            <p className="text-sm text-slate-500">ИНН: 1234567890</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-[#2563EB]">80%</p>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Последняя проверка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">05.10.2025</p>
            <p className="text-sm text-slate-500">3 дня назад</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="journal" className="mb-8">
        <TabsList>
          <TabsTrigger value="journal">
            <Icon name="ClipboardCheck" size={18} className="mr-2" />
            Журнал работ
          </TabsTrigger>
          <TabsTrigger value="estimate">
            <Icon name="FileText" size={18} className="mr-2" />
            Смета
          </TabsTrigger>
          <TabsTrigger value="checks">
            <Icon name="Search" size={18} className="mr-2" />
            Проверки
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Icon name="BarChart3" size={18} className="mr-2" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Журнал строительных работ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                      <Icon name="Image" className="text-slate-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Запись от 05.10.2025</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Выполнены работы по монтажу кровельного покрытия на площади 150 м²
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Внесено: Иванов С.С.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimate" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Смета (актуальная версия)</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Версия 2.1 от 01.09.2025</p>
                </div>
                <Button variant="outline">
                  <Icon name="Download" size={18} className="mr-2" />
                  Экспорт
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-slate-700">Материалы</span>
                  <span className="font-semibold">1 250 000 ₽</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-slate-700">Работы</span>
                  <span className="font-semibold">850 000 ₽</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-slate-700">Прочие расходы</span>
                  <span className="font-semibold">120 000 ₽</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#2563EB] text-white rounded-lg font-bold">
                  <span>Итого:</span>
                  <span>2 220 000 ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Проверки</CardTitle>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать проверку
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '05.10.2025', result: 'Выявлены замечания', status: 'defects' },
                  { date: '01.10.2025', result: 'Соответствует', status: 'ok' },
                ].map((check, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Проверка от {check.date}</p>
                      <p className="text-sm text-slate-600 mt-1">{check.result}</p>
                    </div>
                    <Badge variant={check.status === 'ok' ? 'outline' : 'destructive'}>
                      {check.status === 'ok' ? 'Без замечаний' : 'Замечания'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Аналитика план/факт</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Выполнено работ</span>
                    <span className="font-semibold">80%</span>
                  </div>
                  <Progress value={80} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Освоено средств</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Время выполнения</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <Progress value={65} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkDetail;
