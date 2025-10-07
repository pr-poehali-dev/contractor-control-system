import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface CheckPoint {
  id: string;
  category: string;
  standard: string;
  requirement: string;
  compliant: boolean;
  comment?: string;
}

const InspectionDetail = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();

  const inspection = {
    id: inspectionId,
    date: '05.10.2025',
    workName: 'Замена кровли',
    object: 'ул. Ленина, д. 10',
    project: 'Капремонт Казани 2025',
    inspector: 'Инспектор Петров',
    status: 'completed',
    checkedPoints: 5,
    compliantPoints: 3,
    defectsCount: 2,
    checkPoints: [
      {
        id: '1',
        category: 'Кровельные работы',
        standard: 'ГОСТ 30547-97',
        requirement: 'Качество кровельного покрытия должно соответствовать требованиям проектной документации',
        compliant: false,
        comment: 'Обнаружены механические повреждения металлочерепицы на участке 15 м². Необходима замена повреждённых листов.'
      },
      {
        id: '2',
        category: 'Кровельные работы',
        standard: 'СНиП 3.04.01-87',
        requirement: 'Уклон кровли должен обеспечивать отвод атмосферных осадков',
        compliant: true
      },
      {
        id: '3',
        category: 'Кровельные работы',
        standard: 'ГОСТ 30547-97',
        requirement: 'Места примыканий кровли к стенам и трубам должны быть герметизированы',
        compliant: false,
        comment: 'В местах примыкания кровли к дымоходу отсутствует герметизация. Требуется установка планок примыкания.'
      },
      {
        id: '4',
        category: 'Кровельные работы',
        standard: 'СНиП 2.01.07-85',
        requirement: 'Снеговая нагрузка на кровлю должна соответствовать расчётной',
        compliant: true
      },
      {
        id: '5',
        category: 'Безопасность',
        standard: 'СНиП 12-03-2001',
        requirement: 'Наличие ограждений на высотных работах',
        compliant: true
      },
    ] as CheckPoint[]
  };

  const complianceRate = Math.round((inspection.compliantPoints / inspection.checkedPoints) * 100);

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        Назад
      </Button>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Проверка от {inspection.date}</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт акта
            </Button>
            <Button variant="outline">
              <Icon name="Printer" size={18} className="mr-2" />
              Печать
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-2">
            <Icon name="Wrench" size={18} />
            {inspection.workName}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            {inspection.object}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="User" size={18} />
            {inspection.inspector}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Проверено пунктов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{inspection.checkedPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Соответствует</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{inspection.compliantPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Замечания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{inspection.defectsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Соответствие</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-[#2563EB]">{complianceRate}%</p>
              <Progress value={complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Результаты проверки</h2>
        {inspection.checkPoints.map((point, index) => (
          <Card 
            key={point.id}
            className={`animate-fade-in ${
              !point.compliant ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  point.compliant ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <Icon 
                    name={point.compliant ? 'Check' : 'X'} 
                    className="text-white" 
                    size={24} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{point.standard}</Badge>
                    <Badge variant="secondary">{point.category}</Badge>
                  </div>
                  <CardTitle className="text-base font-medium mb-2">
                    {point.requirement}
                  </CardTitle>
                  {point.comment && (
                    <div className={`p-3 rounded-lg mt-3 ${
                      point.compliant ? 'bg-white' : 'bg-white'
                    }`}>
                      <div className="flex items-start gap-2">
                        <Icon name="AlertCircle" className="text-red-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-red-900 mb-1">Замечание:</p>
                          <p className="text-sm text-red-700">{point.comment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Заключение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-700">
              По результатам проверки выявлено <span className="font-bold text-red-600">{inspection.defectsCount} замечания</span> по 
              несоответствию требованиям нормативной документации. Работы могут быть продолжены после устранения выявленных недостатков.
            </p>
            <div className="flex gap-3">
              <Button>
                <Icon name="FileText" size={18} className="mr-2" />
                Создать акт
              </Button>
              <Button variant="outline" onClick={() => navigate('/defects')}>
                <Icon name="AlertTriangle" size={18} className="mr-2" />
                Просмотреть замечания
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionDetail;
