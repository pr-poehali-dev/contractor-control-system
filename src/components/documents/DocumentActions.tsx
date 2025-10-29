import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface DocumentActionsProps {
  onPrint: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export default function DocumentActions({ 
  onPrint, 
  onEdit, 
  onDownload, 
  onDelete 
}: DocumentActionsProps) {
  return (
    <Card>
      <CardContent className="p-3 space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-slate-50" 
          onClick={onPrint}
        >
          <Icon name="Printer" size={18} className="mr-3 text-slate-600" />
          <span className="text-sm">Печать</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-slate-50"
          onClick={onEdit}
        >
          <Icon name="Edit" size={18} className="mr-3 text-slate-600" />
          <span className="text-sm">Редактировать</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-slate-50"
          onClick={onDownload}
        >
          <Icon name="Download" size={18} className="mr-3 text-slate-600" />
          <span className="text-sm">Скачать</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-slate-50"
        >
          <Icon name="Mail" size={18} className="mr-3 text-slate-600" />
          <span className="text-sm">Отправить клиенту</span>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-slate-50"
        >
          <Icon name="History" size={18} className="mr-3 text-slate-600" />
          <span className="text-sm">История изменений</span>
        </Button>

        <Separator className="my-2" />

        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-3 hover:bg-red-50 text-red-600 hover:text-red-700"
          onClick={onDelete}
        >
          <Icon name="Trash2" size={18} className="mr-3" />
          <span className="text-sm">Удалить</span>
        </Button>
      </CardContent>
    </Card>
  );
}
