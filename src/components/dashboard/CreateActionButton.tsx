import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

interface CreateActionButtonProps {
  userRole?: 'contractor' | 'client' | 'admin';
  onCreateJournal: () => void;
  onCreateInspection: () => void;
  onCreateInfoPost: () => void;
}

const CreateActionButton = ({ userRole, onCreateJournal, onCreateInspection, onCreateInfoPost }: CreateActionButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
          <Icon name="Plus" size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userRole === 'contractor' && (
          <DropdownMenuItem onClick={onCreateJournal}>
            <Icon name="FileText" size={18} className="mr-2" />
            Запись в журнал
          </DropdownMenuItem>
        )}
        {userRole === 'client' && (
          <DropdownMenuItem onClick={onCreateInspection}>
            <Icon name="Calendar" size={18} className="mr-2" />
            Проверку
          </DropdownMenuItem>
        )}
        {userRole === 'admin' && (
          <DropdownMenuItem onClick={onCreateInfoPost}>
            <Icon name="Bell" size={18} className="mr-2" />
            Инфо-пост
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateActionButton;
