import { Button } from '@/components/ui/button';

interface InspectionActionsProps {
  canEdit: boolean;
  isClient: boolean;
  inspectionStatus: string;
  inspectionType: string;
  loading: boolean;
  onSaveDraft: () => void;
  onStartInspection: () => void;
  onCompleteInspection: () => void;
}

export default function InspectionActions({
  canEdit,
  isClient,
  inspectionStatus,
  inspectionType,
  loading,
  onSaveDraft,
  onStartInspection,
  onCompleteInspection
}: InspectionActionsProps) {
  if (!isClient) return null;
  if (inspectionStatus === 'completed') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50">
      <div className="max-w-5xl mx-auto flex gap-3">
        {canEdit && (
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="flex-1"
            disabled={loading}
          >
            Сохранить
          </Button>
        )}
        {inspectionStatus === 'draft' && inspectionType === 'scheduled' && (
          <Button
            onClick={onStartInspection}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            disabled={loading}
          >
            Начать проверку
          </Button>
        )}
        {inspectionStatus === 'active' && (
          <Button
            onClick={onCompleteInspection}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Завершение...' : 'Завершить проверку'}
          </Button>
        )}
      </div>
    </div>
  );
}