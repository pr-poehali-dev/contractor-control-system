import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DefectReportHeaderProps {
  reportNumber: string;
}

const DefectReportHeader = ({ reportNumber }: DefectReportHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-white border-b z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xl">Акт {reportNumber}</h1>
            <p className="text-sm text-slate-500">Акт об обнаружении дефектов</p>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Скачать PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefectReportHeader;
