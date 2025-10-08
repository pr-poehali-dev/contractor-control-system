import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DescriptionTabProps {
  selectedWorkData: any;
}

export default function DescriptionTab({ selectedWorkData }: DescriptionTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Описание работы</h3>
          <Button size="sm" variant="outline">
            <Icon name="Edit" size={16} className="mr-1" />
            Редактировать
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <h4 className="font-semibold mb-2">{selectedWorkData.title}</h4>
              <p className="text-slate-600 mb-4">
                Полное техническое описание работы, требования к выполнению, стандарты качества и прочая важная информация.
              </p>
              
              <h5 className="font-semibold mt-4 mb-2">Требования:</h5>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Соблюдение технологических норм</li>
                <li>Использование сертифицированных материалов</li>
                <li>Ежедневная отчетность в журнале</li>
                <li>Фото-фиксация этапов работы</li>
              </ul>

              <h5 className="font-semibold mt-4 mb-2">Сроки выполнения:</h5>
              <p className="text-slate-600">
                Работа должна быть завершена в течение 14 рабочих дней с момента начала.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
