import { useState, useEffect } from 'react';
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
  controlPoints?: ControlPoint[];
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
  workType = 'Работа',
  controlPoints = mockControlPoints
}: CreateInspectionModalProps) {
  const [checkpoints, setCheckpoints] = useState<CheckpointResult[]>([]);
  const [activeDefectId, setActiveDefectId] = useState<number | null>(null);

  // Reset checkpoints when controlPoints or modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckpoints(
        controlPoints.map(cp => ({
          control_point_id: cp.id,
          status: 'not_checked' as const,
          notes: '',
        }))
      );
      setActiveDefectId(null);
    }
  }, [isOpen, controlPoints]);

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
    const validCheckpoints = checkpoints.filter(cp => cp.status !== 'not_checked');
    
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

    onSubmit({
      journal_entry_id: journalEntryId,
      checkpoints: validCheckpoints,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto p-0 gap-0 w-full h-full md:h-auto md:rounded-lg">
        <DialogHeader className="p-4 md:p-6 border-b sticky top-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Icon name="ClipboardCheck" size={20} className="text-blue-600 md:w-6 md:h-6" />
            Создание проверки
          </DialogTitle>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Вид работ: <span className="font-semibold truncate block md:inline">{workType}</span>
          </p>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 p-4 md:p-6 pb-24 md:pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 md:p-3">
            <p className="text-xs md:text-sm text-blue-900">
              <Icon name="Info" size={14} className="inline mr-1 md:w-4 md:h-4" />
              Контрольные пункты автоматически подгружены из справочников ГОСТ/СНиП для выбранного вида работ
            </p>
          </div>

          {controlPoints.length === 0 ? (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-6 text-center">
                <Icon name="AlertCircle" size={32} className="mx-auto text-amber-600 mb-3" />
                <p className="text-amber-900 font-medium mb-2">
                  Контрольные точки не найдены
                </p>
                <p className="text-sm text-amber-700">
                  Для этого вида работ контрольные точки не настроены в справочнике
                </p>
              </CardContent>
            </Card>
          ) : (
            controlPoints.map((cp) => {
              const checkpoint = checkpoints.find(c => c.control_point_id === cp.id);
              const isNonCompliant = checkpoint?.status === 'non_compliant';
              
              return (
                <Card key={cp.id} className={cn(
                  'border-2',
                  checkpoint?.status === 'compliant' && 'border-green-200 bg-green-50',
                  checkpoint?.status === 'non_compliant' && 'border-amber-200 bg-amber-50'
                )}>
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          {cp.is_critical && (
                            <Badge variant="destructive" className="text-[10px] md:text-xs">Критично</Badge>
                          )}
                        </div>
                        <p className="text-sm md:text-sm font-medium text-slate-800 mb-1.5">{cp.description}</p>
                        <p className="text-[11px] md:text-xs text-blue-600">
                          📋 {cp.standard} • {cp.standard_clause}
                        </p>
                      </div>
                    
                    <div className="flex gap-2 w-full">
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'compliant' ? 'default' : 'outline'}
                        className={cn(
                          'flex-1 text-xs md:text-sm h-9 md:h-10',
                          checkpoint?.status === 'compliant' && 'bg-green-600 hover:bg-green-700'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'compliant')}
                      >
                        <Icon name="Check" size={14} className="mr-1 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Соответствует</span>
                        <span className="md:hidden">✓</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'non_compliant' ? 'default' : 'outline'}
                        className={cn(
                          'flex-1 text-xs md:text-sm h-9 md:h-10',
                          checkpoint?.status === 'non_compliant' && 'bg-amber-600 hover:bg-amber-700'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'non_compliant')}
                      >
                        <Icon name="X" size={14} className="mr-1 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Не соответствует</span>
                        <span className="md:hidden">✗</span>
                      </Button>
                    </div>
                    </div>
                  </CardContent>

                  {isNonCompliant && checkpoint.defect && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-amber-300 space-y-3 px-3 md:px-0">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Icon name="AlertTriangle" size={14} className="md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-semibold">Добавить замечание</span>
                      </div>
                      
                      <div>
                        <Label className="text-xs md:text-sm">Описание замечания *</Label>
                        <Textarea
                          placeholder="Опишите выявленное несоответствие..."
                          value={checkpoint.defect.description}
                          onChange={(e) => handleDefectChange(cp.id, 'description', e.target.value)}
                          rows={3}
                          className="mt-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs md:text-sm">Ссылка на норматив *</Label>
                        <Input
                          placeholder="СНиП 3.03.01-87, п. 4.5"
                          value={checkpoint.defect.standard_reference}
                          onChange={(e) => handleDefectChange(cp.id, 'standard_reference', e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs md:text-sm">Фотофиксация</Label>
                        <div className="mt-1 border-2 border-dashed border-amber-300 rounded-lg p-3 md:p-4 text-center">
                          <Icon name="Camera" size={24} className="mx-auto text-amber-400 mb-2 md:w-8 md:h-8" />
                          <p className="text-[11px] md:text-xs text-slate-600">Прикрепите фото</p>
                          <Button variant="outline" size="sm" className="mt-2 h-8 text-xs">
                            Выбрать файлы
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-white border-t p-3 md:p-4 flex-row gap-2 md:gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none">
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none">
            <Icon name="Save" size={16} className="mr-2" />
            <span className="hidden md:inline">Создать проверку</span>
            <span className="md:hidden">Создать</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}