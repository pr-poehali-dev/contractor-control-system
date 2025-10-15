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
  onControlPointClick: (cp: ControlPoint) => void;
}

export default function ControlPointsSection({
  controlPoints,
  checkedPoints,
  onControlPointClick
}: ControlPointsSectionProps) {
  if (controlPoints.length === 0) return null;

  const checkedCount = controlPoints.filter(cp => checkedPoints.has(String(cp.id))).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <Icon name="ClipboardList" size={18} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Что проверить?</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
          {checkedCount} / {controlPoints.length}
        </span>
      </div>
      
      <p className="text-xs text-slate-500 mb-4">
        Нажмите на пункт, чтобы быстро добавить замечание
      </p>
      
      <div className="space-y-2">
        {controlPoints.map((cp) => {
          const cpId = String(cp.id);
          const isChecked = checkedPoints.has(cpId);
          
          return (
            <div 
              key={cpId}
              className={`border rounded-xl p-4 cursor-pointer transition-all active:scale-98 ${
                isChecked 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm' 
                  : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => onControlPointClick(cp)}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                  isChecked 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white border-slate-300'
                }`}>
                  {isChecked && <Icon name="Check" size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {cp.standard}
                    </span>
                    {cp.is_critical && (
                      <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Icon name="AlertTriangle" size={12} />
                        Критично
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">{cp.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}