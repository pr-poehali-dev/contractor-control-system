import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

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

  const checkedCount = controlPoints.filter(cp => checkedPoints.has(String(cp.id))).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Icon name="ListChecks" size={18} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Контрольные точки</h3>
        </div>
        <span className="text-sm text-slate-500 font-medium">
          {checkedCount} / {controlPoints.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {controlPoints.map((cp) => {
          const cpId = String(cp.id);
          const isChecked = checkedPoints.has(cpId);
          
          return (
            <div 
              key={cpId}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                isChecked 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
              onClick={() => onToggleCheckpoint(cpId)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isChecked}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {cp.standard}
                    </span>
                    {cp.is_critical && (
                      <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        Критично
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{cp.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}