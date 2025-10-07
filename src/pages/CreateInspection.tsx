import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface CheckPoint {
  id: string;
  category: string;
  standard: string;
  requirement: string;
  checked: boolean;
  compliant: boolean | null;
  comment: string;
  hint?: string;
}

const mockCheckPoints: CheckPoint[] = [
  {
    id: '1',
    category: 'Кровельные работы',
    standard: 'ГОСТ 30547-97',
    requirement: 'Качество кровельного покрытия должно соответствовать требованиям проектной документации',
    checked: false,
    compliant: null,
    comment: '',
    hint: 'Проверьте отсутствие механических повреждений, правильность укладки листов'
  },
  {
    id: '2',
    category: 'Кровельные работы',
    standard: 'СНиП 3.04.01-87',
    requirement: 'Уклон кровли должен обеспечивать отвод атмосферных осадков',
    checked: false,
    compliant: null,
    comment: '',
    hint: 'Минимальный уклон для металлочерепицы - 14 градусов'
  },
  {
    id: '3',
    category: 'Кровельные работы',
    standard: 'ГОСТ 30547-97',
    requirement: 'Места примыканий кровли к стенам и трубам должны быть герметизированы',
    checked: false,
    compliant: null,
    comment: '',
    hint: 'Используйте специальные планки примыкания и герметик'
  },
  {
    id: '4',
    category: 'Кровельные работы',
    standard: 'СНиП 2.01.07-85',
    requirement: 'Снеговая нагрузка на кровлю должна соответствовать расчётной',
    checked: false,
    compliant: null,
    comment: '',
    hint: 'Проверьте соответствие конструкции проекту и снеговому району'
  },
  {
    id: '5',
    category: 'Безопасность',
    standard: 'СНиП 12-03-2001',
    requirement: 'Наличие ограждений на высотных работах',
    checked: false,
    compliant: null,
    comment: '',
    hint: 'Проверьте установку защитных ограждений'
  },
];

const CreateInspection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>(mockCheckPoints);
  const [selectedPoint, setSelectedPoint] = useState<CheckPoint | null>(null);

  const handleCheckChange = (id: string, compliant: boolean) => {
    setCheckPoints(points =>
      points.map(p =>
        p.id === id ? { ...p, checked: true, compliant } : p
      )
    );
  };

  const handleCommentChange = (id: string, comment: string) => {
    setCheckPoints(points =>
      points.map(p =>
        p.id === id ? { ...p, comment } : p
      )
    );
  };

  const handleSubmit = () => {
    const checkedCount = checkPoints.filter(p => p.checked).length;
    const defectsCount = checkPoints.filter(p => p.compliant === false).length;

    toast({
      title: 'Проверка завершена',
      description: `Проверено пунктов: ${checkedCount}. Выявлено замечаний: ${defectsCount}`,
    });
    navigate(-1);
  };

  const checkedCount = checkPoints.filter(p => p.checked).length;
  const defectsCount = checkPoints.filter(p => p.compliant === false).length;

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Новая проверка</h1>
        <p className="text-slate-600">Замена кровли • ул. Ленина, д. 10</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего пунктов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{checkPoints.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Проверено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">{checkedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Замечания</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{defectsCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Контрольные пункты</h2>
          {checkPoints.map((point, index) => (
            <Card 
              key={point.id}
              className={`cursor-pointer transition-all animate-fade-in ${
                selectedPoint?.id === point.id ? 'ring-2 ring-[#2563EB]' : ''
              } ${
                point.compliant === false ? 'border-red-300 bg-red-50' : ''
              } ${
                point.compliant === true ? 'border-green-300 bg-green-50' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedPoint(point)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-1">
                    {point.compliant === true && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Icon name="Check" className="text-white" size={16} />
                      </div>
                    )}
                    {point.compliant === false && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Icon name="X" className="text-white" size={16} />
                      </div>
                    )}
                    {point.compliant === null && (
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {point.standard}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {point.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-medium">{point.requirement}</CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          {selectedPoint ? (
            <Card>
              <CardHeader>
                <CardTitle>Проверка пункта</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2">{selectedPoint.standard}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Требование:</h3>
                  <p className="text-sm text-slate-600">{selectedPoint.requirement}</p>
                </div>

                {selectedPoint.hint && (
                  <Alert>
                    <Icon name="Lightbulb" className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <span className="font-medium">Подсказка:</span> {selectedPoint.hint}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label className="text-base">Результат проверки:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedPoint.compliant === true ? 'default' : 'outline'}
                      className="h-auto py-4"
                      onClick={() => handleCheckChange(selectedPoint.id, true)}
                    >
                      <div className="text-center">
                        <Icon name="CheckCircle2" size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Соответствует</p>
                      </div>
                    </Button>
                    <Button
                      variant={selectedPoint.compliant === false ? 'destructive' : 'outline'}
                      className="h-auto py-4"
                      onClick={() => handleCheckChange(selectedPoint.id, false)}
                    >
                      <div className="text-center">
                        <Icon name="XCircle" size={24} className="mx-auto mb-2" />
                        <p className="font-medium">Не соответствует</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {selectedPoint.compliant === false && (
                  <div className="space-y-2">
                    <Label htmlFor="comment">Описание замечания:</Label>
                    <Textarea
                      id="comment"
                      placeholder="Опишите выявленное несоответствие..."
                      value={selectedPoint.comment}
                      onChange={(e) => handleCommentChange(selectedPoint.id, e.target.value)}
                      rows={4}
                    />
                    <Button variant="outline" size="sm" className="w-full">
                      <Icon name="Camera" size={16} className="mr-2" />
                      Добавить фото
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Icon name="ClipboardCheck" size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Выберите пункт для проверки</p>
              </CardContent>
            </Card>
          )}

          {selectedPoint && (
            <Button 
              size="lg" 
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={checkedCount === 0}
            >
              <Icon name="Save" size={20} className="mr-2" />
              Завершить проверку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInspection;
