import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BuildingObject } from './types';

interface ObjectHeaderProps {
  object: BuildingObject;
  onBack: () => void;
}

const ObjectHeader = ({ object, onBack }: ObjectHeaderProps) => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
        >
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
        >
          <Icon name="MoreVertical" size={20} />
        </Button>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-4 flex items-center justify-center">
          <Icon name="Building2" size={40} className="text-blue-600" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">{object.title}</h1>
      </div>
    </div>
  );
};

export default ObjectHeader;
