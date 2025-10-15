import { Button } from '@/components/ui/button';

interface InspectionActionsProps {
  loading: boolean;
  onSaveDraft: () => void;
  onComplete: () => void;
}

export default function InspectionActions({
  loading,
  onSaveDraft,
  onComplete
}: InspectionActionsProps) {
  return (
    <div className="flex gap-3 sticky bottom-4">
      <Button
        variant="outline"
        onClick={onSaveDraft}
        className="flex-1"
        disabled={loading}
      >
        Сохранить
      </Button>
      <Button
        onClick={onComplete}
        className="flex-1"
        disabled={loading}
      >
        {loading ? 'Завершение...' : 'Завершить проверку'}
      </Button>
    </div>
  );
}
