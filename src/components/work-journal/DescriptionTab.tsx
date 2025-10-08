import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DescriptionTabProps {
  selectedWorkData: any;
}

export default function DescriptionTab({ selectedWorkData }: DescriptionTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl font-bold">Описание работы</h3>
          <Button variant="outline">
            <Icon name="Edit" size={18} className="mr-2" />
            Редактировать
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 lg:p-12">
            <div className="prose max-w-none">
              <h4 className="text-2xl font-semibold mb-4">{selectedWorkData.title}</h4>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Полное техническое описание работы, требования к выполнению, стандарты качества и прочая важная информация.
              </p>
              
              <h5 className="text-xl font-semibold mt-8 mb-4">Требования:</h5>
              <ul className="list-disc list-inside text-lg text-slate-600 space-y-3">
                <li>Соблюдение технологических норм</li>
                <li>Использование сертифицированных материалов</li>
                <li>Ежедневная отчетность в журнале</li>
                <li>Фото-фиксация этапов работы</li>
              </ul>

              <h5 className="text-lg font-semibold mt-6 mb-3">Сроки выполнения:</h5>
              <p className="text-base text-slate-600">
                Работа должна быть завершена в течение 14 рабочих дней с момента начала.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}