import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface InspectionNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  disabled: boolean;
}

export default function InspectionNotes({ notes, onNotesChange, disabled }: InspectionNotesProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-slate-100 p-1.5 rounded-lg">
          <Icon name="FileText" size={18} className="text-slate-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Примечания</h3>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Общие примечания по проверке..."
        rows={4}
        disabled={disabled}
        className="text-sm resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}