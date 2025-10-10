import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WorkTemplate } from './types';

interface WorkTemplateDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkTemplate | null;
  onConfirm: () => void;
}

const WorkTemplateDeleteDialog = ({
  open,
  onOpenChange,
  template,
  onConfirm,
}: WorkTemplateDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить вид работы?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить "{template?.name}"? Это действие
            нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WorkTemplateDeleteDialog;
