import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DefectReportCardProps {
  defectReport: any;
  loadingReport: boolean;
  onCreateReport: () => void;
}

export default function DefectReportCard({
  defectReport,
  loadingReport,
  onCreateReport
}: DefectReportCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <Icon name="FileText" size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Акт об обнаружении дефектов</h3>
            {defectReport ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Hash" size={16} />
                  <span className="font-medium">Номер акта:</span>
                  <span>{defectReport.report_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="AlertCircle" size={16} />
                  <span>Всего замечаний: {defectReport.total_defects}</span>
                  {defectReport.critical_defects > 0 && (
                    <span className="text-red-600 font-medium">
                      (критических: {defectReport.critical_defects})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Calendar" size={16} />
                  <span>Сформирован: {new Date(defectReport.created_at).toLocaleString('ru-RU')}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/defect-report/${defectReport.id}`)}
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  Просмотреть акт
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Проверка завершена с замечаниями. 
                  Необходимо сформировать акт об обнаружении дефектов.
                </p>
                <Button 
                  onClick={onCreateReport}
                  disabled={loadingReport}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loadingReport ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Формирование...
                    </>
                  ) : (
                    <>
                      <Icon name="FilePlus" size={16} className="mr-2" />
                      Сформировать акт
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
