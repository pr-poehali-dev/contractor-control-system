import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BuildingObject } from './types';

interface InfoTabProps {
  object: BuildingObject;
  formatDate: (dateString: string) => string;
}

const InfoTab = ({ object, formatDate }: InfoTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Даты</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <span className="text-slate-600 text-sm md:text-base">Дата старта работ</span>
                <span className="text-slate-900 font-medium text-sm md:text-base">
                  {object.created_at ? formatDate(object.created_at) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <span className="text-slate-600 text-sm md:text-base">Дата заключения договора</span>
                <span className="text-slate-900 font-medium text-sm md:text-base">
                  {object.updated_at ? formatDate(object.updated_at) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Характеристики</h2>
        <div className="space-y-3">
          {object.address && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <span className="text-slate-600 text-sm md:text-base">Адрес</span>
                  <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                    {object.address}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {object.description && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <span className="text-slate-600 text-sm md:text-base">Описание</span>
                  <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                    {object.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-sm md:text-base">Проект</span>
                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-sm md:text-base">Разрешительная документация</span>
                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
