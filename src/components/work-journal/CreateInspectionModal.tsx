import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ControlPoint } from '@/types/journal';

interface CreateInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InspectionFormData) => void;
  journalEntryId?: number;
  workType?: string;
}

export interface CheckpointResult {
  control_point_id: number;
  status: 'compliant' | 'non_compliant' | 'not_checked';
  notes?: string;
  defect?: {
    description: string;
    standard_reference: string;
    photos: string[];
  };
}

export interface InspectionFormData {
  journal_entry_id?: number;
  checkpoints: CheckpointResult[];
}

const mockControlPoints: ControlPoint[] = [
  {
    id: 1,
    category: 'Кирпичная кладка',
    description: 'Толщина горизонтальных швов должна составлять 12 мм',
    standard: 'СНиП 3.03.01-87',
    standard_clause: 'п. 4.5',
    is_critical: true,
  },
  {
    id: 2,
    category: 'Кирпичная кладка',
    description: 'Толщина вертикальных швов должна составлять 10 мм',
    standard: 'СНиП 3.03.01-87',
    standard_clause: 'п. 4.5',
    is_critical: true,
  },
  {
    id: 3,
    category: 'Кирпичная кладка',
    description: 'Отклонение рядов кладки от горизонтали не должно превышать 15 мм на 10 м',
    standard: 'СНиП 3.03.01-87',
    standard_clause: 'п. 4.12',
    is_critical: false,
  },
  {
    id: 4,
    category: 'Кирпичная кладка',
    description: 'Отклонение стен от вертикали не должно превышать 10 мм на этаж',
    standard: 'СНиП 3.03.01-87',
    standard_clause: 'п. 4.12',
    is_critical: true,
  },
  {
    id: 5,
    category: 'Качество материалов',
    description: 'Кирпич должен соответствовать проектной марке прочности',
    standard: 'ГОСТ 530-2012',
    standard_clause: 'п. 5.1',
    is_critical: true,
  },
];

export default function CreateInspectionModal({
  isOpen,
  onClose,
  onSubmit,
  journalEntryId,
  workType = 'Кирпичная кладка'
}: CreateInspectionModalProps) {
  const [checkpoints, setCheckpoints] = useState<CheckpointResult[]>(
    mockControlPoints.map(cp => ({
      control_point_id: cp.id,
      status: 'not_checked' as const,
      notes: '',
    }))
  );
  const [activeDefectId, setActiveDefectId] = useState<number | null>(null);

  const handleCheckpointStatusChange = (cpId: number, status: 'compliant' | 'non_compliant') => {
    setCheckpoints(prev => prev.map(cp => {
      if (cp.control_point_id === cpId) {
        if (status === 'non_compliant') {
          setActiveDefectId(cpId);
          return { 
            ...cp, 
            status,
            defect: cp.defect || { description: '', standard_reference: '', photos: [] }
          };
        }
        return { ...cp, status, defect: undefined };
      }
      return cp;
    }));
  };

  const handleDefectChange = (cpId: number, field: string, value: any) => {
    setCheckpoints(prev => prev.map(cp => {
      if (cp.control_point_id === cpId && cp.defect) {
        return {
          ...cp,
          defect: { ...cp.defect, [field]: value }
        };
      }
      return cp;
    }));
  };

  const handleSubmit = () => {
    console.log('=== MODAL SUBMIT START ===');
    const validCheckpoints = checkpoints.filter(cp => cp.status !== 'not_checked');
    console.log('Valid checkpoints:', validCheckpoints);
    
    if (validCheckpoints.length === 0) {
      alert('Необходимо проверить хотя бы один пункт');
      return;
    }

    const hasInvalidDefects = validCheckpoints.some(cp => 
      cp.status === 'non_compliant' && (!cp.defect?.description || !cp.defect?.standard_reference)
    );

    if (hasInvalidDefects) {
      alert('Заполните описание и ссылку на норматив для всех замечаний');
      return;
    }

    console.log('Submitting inspection data:', {
      journal_entry_id: journalEntryId,
      checkpoints: validCheckpoints,
    });

    onSubmit({
      journal_entry_id: journalEntryId,
      checkpoints: validCheckpoints,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={24} className="text-blue-600" />
            Создание проверки
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Вид работ: <span className="font-semibold">{workType}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <Icon name="Info" size={16} className="inline mr-1" />
              Контрольные пункты автоматически подгружены из справочников ГОСТ/СНиП для выбранного вида работ
            </p>
          </div>

          {mockControlPoints.map((cp) => {
            const checkpoint = checkpoints.find(c => c.control_point_id === cp.id);
            const isNonCompliant = checkpoint?.status === 'non_compliant';
            
            return (
              <Card key={cp.id} className={cn(
                'border-2',
                checkpoint?.status === 'compliant' && 'border-green-200 bg-green-50',
                checkpoint?.status === 'non_compliant' && 'border-amber-200 bg-amber-50'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        {cp.is_critical && (
                          <Badge variant="destructive" className="text-xs">Критично</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{cp.category}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mb-1">{cp.description}</p>
                      <p className="text-xs text-blue-600">
                        📋 {cp.standard} • {cp.standard_clause}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'compliant' ? 'default' : 'outline'}
                        className={cn(
                          checkpoint?.status === 'compliant' && 'bg-green-600 hover:bg-green-700'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'compliant')}
                      >
                        <Icon name="Check" size={16} className="mr-1" />
                        Соответствует
                      </Button>
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'non_compliant' ? 'default' : 'outline'}
                        className={cn(
                          checkpoint?.status === 'non_compliant' && 'bg-amber-600 hover:bg-amber-700'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'non_compliant')}
                      >
                        <Icon name="X" size={16} className="mr-1" />
                        Не соответствует
                      </Button>
                    </div>
                  </div>

                  {isNonCompliant && checkpoint.defect && (
                    <div className="mt-4 pt-4 border-t border-amber-300 space-y-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Icon name="AlertTriangle" size={16} />
                        <span className="text-sm font-semibold">Добавить замечание</span>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Описание замечания *</Label>
                        <Textarea
                          placeholder="Опишите выявленное несоответствие..."
                          value={checkpoint.defect.description}
                          onChange={(e) => handleDefectChange(cp.id, 'description', e.target.value)}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Ссылка на норматив *</Label>
                        <Input
                          placeholder="Например: СНиП 3.03.01-87, п. 4.5"
                          value={checkpoint.defect.standard_reference}
                          onChange={(e) => handleDefectChange(cp.id, 'standard_reference', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Фотофиксация</Label>
                        <div className="mt-1 border-2 border-dashed border-amber-300 rounded-lg p-4 text-center">
                          <Icon name="Camera" size={32} className="mx-auto text-amber-400 mb-2" />
                          <p className="text-xs text-slate-600">Прикрепите фото</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Выбрать файлы
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Icon name="Save" size={16} className="mr-2" />
            Создать проверку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}