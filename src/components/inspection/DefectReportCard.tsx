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
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="bg-blue-100 rounded-full p-2 md:p-3">
            <Icon name="FileText" size={20} className="text-blue-600 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg mb-2">Акт об обнаружении дефектов</h3>
            {defectReport ? (
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                  <Icon name="Hash" size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span className="font-medium">Номер акта:</span>
                  <span className="truncate">{defectReport.report_number}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-600">
                  <Icon name="AlertCircle" size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span>Всего замечаний: {defectReport.total_defects}</span>
                  {defectReport.critical_defects > 0 && (
                    <span className="text-red-600 font-medium">
                      (критических: {defectReport.critical_defects})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                  <Icon name="Calendar" size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">Сформирован: {new Date(defectReport.created_at).toLocaleString('ru-RU')}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/defect-report/${defectReport.id}`)}
                    className="flex-1 sm:flex-none"
                  >
                    <Icon name="Eye" size={16} className="mr-2" />
                    Просмотреть акт
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/documents')}
                    className="flex-1 sm:flex-none"
                  >
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Все документы
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs md:text-sm text-slate-600">
                  Проверка завершена с замечаниями. 
                  Необходимо сформировать акт об обнаружении дефектов.
                </p>
                <Button 
                  onClick={onCreateReport}
                  disabled={loadingReport}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
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