import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export interface ControlPoint {
  id: string | number;
  description: string;
  standard: string;
  standard_clause: string;
  is_critical: boolean;
}

interface ControlPointsSectionProps {
  controlPoints: ControlPoint[];
  checkedPoints: Set<string>;
  onToggleCheckpoint: (cpId: string) => void;
}

export default function ControlPointsSection({
  controlPoints,
  checkedPoints,
  onToggleCheckpoint
}: ControlPointsSectionProps) {
  if (controlPoints.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Рекомендации для проверки</h3>
        <div className="space-y-3">
          {controlPoints.map((cp) => {
            const cpId = String(cp.id);
            const isChecked = checkedPoints.has(cpId);
            
            return (
              <div 
                key={cpId}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isChecked ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-slate-50'
                }`}
                onClick={() => onToggleCheckpoint(cpId)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isChecked}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Соответствие с регламентом {cp.standard}
                    </p>
                    <p className="text-sm text-slate-700">{cp.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
