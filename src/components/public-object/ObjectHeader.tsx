import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BuildingObject } from './types';
import { ROUTES } from '@/constants/routes';

interface ObjectHeaderProps {
  object: BuildingObject;
  onBack: () => void;
}

const ObjectHeader = ({ object, onBack }: ObjectHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
          <Icon name="Building2" size={24} className="text-blue-600" />
        </div>
        <h1 className="text-lg md:text-xl font-bold text-slate-900 flex-1">{object.title}</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(ROUTES.WORK_CREATE(object.id))}
          className="flex-shrink-0"
          title="Настройки объекта"
        >
          <Icon name="Settings" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ObjectHeader;