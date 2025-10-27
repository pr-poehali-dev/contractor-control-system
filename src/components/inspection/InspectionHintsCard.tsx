import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Hint {
  id: string;
  type: 'gost' | 'snip' | 'material' | 'time';
  title: string;
  content: string;
  code?: string;
}

const mockHints: Hint[] = [
  {
    id: '1',
    type: 'gost',
    title: 'ГОСТ 30494-2011',
    content: 'Параметры микроклимата в помещениях: температура 20-22°C, влажность 30-45%, скорость движения воздуха не более 0,15 м/с',
    code: 'ГОСТ 30494-2011'
  },
  {
    id: '2',
    type: 'snip',
    title: 'СП 73.13330.2016',
    content: 'Внутренние санитарно-технические системы зданий. Требования к монтажу вентиляционных систем и испытаниям',
    code: 'СП 73.13330.2016'
  },
  {
    id: '3',
    type: 'material',
    title: 'Расход материалов',
    content: 'Вентиляционные воздуховоды: 1.2 кг крепежа на 10 м² воздуховода, герметик - 0.3 кг на 5 п.м. стыков',
  },
  {
    id: '4',
    type: 'time',
    title: 'Норматив времени',
    content: 'Монтаж вентиляции: 0.8-1.2 чел/час на 1 м² воздуховода, пусконаладка - 4-6 часов на систему',
  }
];

const getHintIcon = (type: string) => {
  switch(type) {
    case 'gost': return 'FileText';
    case 'snip': return 'BookOpen';
    case 'material': return 'Package';
    case 'time': return 'Clock';
    default: return 'Info';
  }
};

const getHintBadgeColor = (type: string) => {
  switch(type) {
    case 'gost': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'snip': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'material': return 'bg-green-50 text-green-700 border-green-200';
    case 'time': return 'bg-orange-50 text-orange-700 border-orange-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getHintLabel = (type: string) => {
  switch(type) {
    case 'gost': return 'ГОСТ';
    case 'snip': return 'СНиП';
    case 'material': return 'Материалы';
    case 'time': return 'Время';
    default: return 'Подсказка';
  }
};

export default function InspectionHintsCard() {
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  const toggleHint = (id: string) => {
    setExpandedHints(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon name="Lightbulb" size={18} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Подсказки от ИИ</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          ГОСТы, СНиПы и нормативы для правильной оценки выполненных работ
        </p>

        <div className="space-y-2">
          {mockHints.map(hint => (
            <div 
              key={hint.id} 
              className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
            >
              <button
                onClick={() => toggleHint(hint.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className="flex-shrink-0">
                  <Icon 
                    name={getHintIcon(hint.type)} 
                    size={18} 
                    className="text-slate-600" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 ${getHintBadgeColor(hint.type)}`}
                    >
                      {getHintLabel(hint.type)}
                    </Badge>
                    {hint.code && (
                      <span className="text-xs text-slate-500">{hint.code}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-slate-900 truncate">
                    {hint.title}
                  </h3>
                </div>
                <Icon 
                  name={expandedHints.has(hint.id) ? "ChevronUp" : "ChevronDown"} 
                  size={18} 
                  className="text-slate-400 flex-shrink-0" 
                />
              </button>
              
              {expandedHints.has(hint.id) && (
                <div className="px-3 pb-3 pt-0 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {hint.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}