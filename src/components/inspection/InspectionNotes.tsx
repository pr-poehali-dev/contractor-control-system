import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface InspectionNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  disabled: boolean;
}

export default function InspectionNotes({ notes, onNotesChange, disabled }: InspectionNotesProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Примечания</h3>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Общие примечания по проверке..."
          rows={3}
          disabled={disabled}
          className="text-sm"
        />
      </CardContent>
    </Card>
  );
}
