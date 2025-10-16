import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface DefectReportInfoProps {
  report: {
    report_number: string;
    object_title: string;
    work_title: string;
    created_at: string;
    total_defects: number;
    critical_defects: number;
  };
  progress: number;
}

const DefectReportInfo = ({ report, progress }: DefectReportInfoProps) => {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-lg p-2.5">
                <Icon name="FileText" size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Номер акта</p>
                <p className="font-semibold">{report.report_number}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-lg p-2.5">
                <Icon name="Building2" size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Объект</p>
                <p className="font-semibold">{report.object_title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2.5">
                <Icon name="Wrench" size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Вид работ</p>
                <p className="font-semibold">{report.work_title}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-lg p-2.5">
                <Icon name="Calendar" size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Дата формирования</p>
                <p className="font-semibold">
                  {new Date(report.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-lg p-2.5">
                <Icon name="AlertTriangle" size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Всего замечаний</p>
                <p className="font-semibold">
                  {report.total_defects} шт.
                  {report.critical_defects > 0 && (
                    <span className="text-red-600 text-sm ml-2">
                      ({report.critical_defects} критических)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 rounded-lg p-2.5">
                <Icon name="TrendingUp" size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Прогресс устранения</p>
                <Progress value={progress} className="h-2" />
                <p className="text-sm font-semibold mt-1">{progress}% завершено</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefectReportInfo;