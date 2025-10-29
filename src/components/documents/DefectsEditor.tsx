import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Defect {
  number: number;
  description: string;
  location: string;
  severity: string;
  severityLabel: string;
  responsible: string;
  deadline: string;
}

interface DefectsEditorProps {
  defects: Defect[];
  onChange: (defects: Defect[]) => void;
}

export default function DefectsEditor({ defects, onChange }: DefectsEditorProps) {
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setExpanded(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleFieldChange = (index: number, field: keyof Defect, value: string) => {
    const updated = [...defects];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'severity') {
      const severityLabels: Record<string, string> = {
        critical: 'Критическая',
        high: 'Высокая',
        medium: 'Средняя'
      };
      updated[index].severityLabel = severityLabels[value] || 'Средняя';
    }
    
    onChange(updated);
  };

  const addDefect = () => {
    const newDefect: Defect = {
      number: defects.length + 1,
      description: '',
      location: '',
      severity: 'medium',
      severityLabel: 'Средняя',
      responsible: '',
      deadline: ''
    };
    onChange([...defects, newDefect]);
    setExpanded([...expanded, defects.length]);
  };

  const removeDefect = (index: number) => {
    const updated = defects.filter((_, i) => i !== index);
    const renumbered = updated.map((d, i) => ({ ...d, number: i + 1 }));
    onChange(renumbered);
    setExpanded(expanded.filter(i => i < index));
  };

  return (
    <div className="space-y-3">
      {defects.map((defect, index) => (
        <Card key={index} className="overflow-hidden">
          <div 
            className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                defect.severity === 'critical' ? 'bg-red-100 text-red-700' :
                defect.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {defect.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {defect.description || `Дефект ${defect.number}`}
                </p>
                <p className="text-xs text-slate-500">{defect.location || 'Местоположение не указано'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon 
                name={expanded.includes(index) ? 'ChevronUp' : 'ChevronDown'} 
                size={20} 
                className="text-slate-400"
              />
            </div>
          </div>
          
          {expanded.includes(index) && (
            <CardContent className="p-4 space-y-3 border-t">
              <div>
                <Label className="text-xs">Описание дефекта</Label>
                <Textarea
                  value={defect.description}
                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                  placeholder="Опишите дефект"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Местоположение</Label>
                <Input
                  value={defect.location}
                  onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
                  placeholder="Где обнаружен дефект"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Серьезность</Label>
                  <Select
                    value={defect.severity}
                    onValueChange={(value) => handleFieldChange(index, 'severity', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Критическая</SelectItem>
                      <SelectItem value="high">Высокая</SelectItem>
                      <SelectItem value="medium">Средняя</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Срок устранения</Label>
                  <Input
                    type="date"
                    value={defect.deadline}
                    onChange={(e) => handleFieldChange(index, 'deadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Ответственный</Label>
                <Input
                  value={defect.responsible}
                  onChange={(e) => handleFieldChange(index, 'responsible', e.target.value)}
                  placeholder="ФИО ответственного"
                  className="mt-1"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDefect(index)}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить дефект
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addDefect}
        className="w-full"
      >
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить дефект
      </Button>
    </div>
  );
}
