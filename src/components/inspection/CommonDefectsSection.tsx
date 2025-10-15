import Icon from '@/components/ui/icon';

interface CommonDefectsSectionProps {
  onSelectDefect: (description: string) => void;
}

const COMMON_DEFECTS = [
  { id: '1', title: 'Отклонение от проектной документации', description: 'Выявлено несоответствие выполненных работ проектной документации' },
  { id: '2', title: 'Некачественное выполнение работ', description: 'Работы выполнены с нарушением технологии и требований качества' },
  { id: '3', title: 'Материалы несоответствующего качества', description: 'Использованы материалы, не соответствующие требованиям проекта' },
  { id: '4', title: 'Нарушение технологии производства', description: 'Нарушена последовательность или технология выполнения работ' },
  { id: '5', title: 'Дефекты поверхности', description: 'Обнаружены трещины, сколы, неровности поверхности' },
  { id: '6', title: 'Нарушение геометрических размеров', description: 'Отклонение фактических размеров от проектных' },
  { id: '7', title: 'Некачественная гидроизоляция', description: 'Выявлены дефекты устройства гидроизоляции' },
  { id: '8', title: 'Дефекты окраски и отделки', description: 'Некачественное выполнение отделочных работ' },
  { id: '9', title: 'Нарушение правил безопасности', description: 'Нарушены требования техники безопасности при производстве работ' },
  { id: '10', title: 'Загрязнение строительной площадки', description: 'Не обеспечена чистота и порядок на стройплощадке' }
];

export default function CommonDefectsSection({ onSelectDefect }: CommonDefectsSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-orange-100 p-1.5 rounded-lg">
          <Icon name="FileWarning" size={18} className="text-orange-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Типовые нарушения</h3>
      </div>
      
      <p className="text-xs text-slate-500 mb-4">
        Нажмите на нарушение, чтобы добавить его в замечание
      </p>
      
      <div className="space-y-2">
        {COMMON_DEFECTS.map((defect) => (
          <div 
            key={defect.id}
            className="border rounded-xl p-4 cursor-pointer transition-all active:scale-98 bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-orange-300 hover:shadow-md"
            onClick={() => onSelectDefect(defect.description)}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full border-2 bg-white border-slate-300 flex items-center justify-center mt-0.5">
                <Icon name="Plus" size={12} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-relaxed font-medium mb-1">{defect.title}</p>
                <p className="text-xs text-slate-500">{defect.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
