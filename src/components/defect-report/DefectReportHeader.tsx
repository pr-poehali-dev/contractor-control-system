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
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base md:text-xl truncate">Акт {reportNumber}</h1>
            <p className="text-xs md:text-sm text-slate-500 truncate">Акт об обнаружении дефектов</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Icon name="Download" size={16} className="mr-2" />
            Скачать PDF
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Icon name="Download" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefectReportHeader;