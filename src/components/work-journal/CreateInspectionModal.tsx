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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 w-[calc(100%-2rem)] md:w-full rounded-2xl">
        <DialogHeader className="p-4 md:p-6 border-b sticky top-0 bg-gradient-to-b from-white to-slate-50/80 backdrop-blur-sm z-10 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2.5 text-base md:text-xl font-bold">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Icon name="ClipboardCheck" size={18} className="text-blue-600 md:w-5 md:h-5" />
            </div>
            Создание проверки
          </DialogTitle>
          <p className="text-xs md:text-sm text-slate-600 mt-2">
            <span className="text-slate-500">Вид работ:</span> <span className="font-semibold text-slate-800">{workType}</span>
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-180px)] md:max-h-[calc(85vh-180px)]">
          <div className="space-y-3 md:space-y-4 p-4 md:p-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-3 md:p-4 shadow-sm">
              <div className="flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="Info" size={12} className="text-blue-700" />
                </div>
                <p className="text-xs md:text-sm text-blue-900 leading-relaxed">
                  Контрольные пункты автоматически подгружены из справочников ГОСТ/СНиП для выбранного вида работ
                </p>
              </div>
            </div>

          {controlPoints.length === 0 ? (
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl shadow-sm">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="AlertCircle" size={32} className="text-amber-600" />
                </div>
                <p className="text-amber-900 font-semibold mb-2 text-base">
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
                  'border-2 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md',
                  checkpoint?.status === 'compliant' && 'border-green-300 bg-gradient-to-br from-green-50 to-green-100/30',
                  checkpoint?.status === 'non_compliant' && 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/30',
                  !checkpoint?.status || checkpoint?.status === 'not_checked' && 'border-slate-200 bg-white hover:border-slate-300'
                )}>
                  <CardContent className="p-3.5 md:p-5">
                    <div className="space-y-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2.5">
                          {cp.is_critical && (
                            <Badge variant="destructive" className="text-[10px] md:text-xs px-2 py-0.5 rounded-md shadow-sm">
                              <Icon name="AlertTriangle" size={10} className="mr-1" />
                              Критично
                            </Badge>
                          )}
                        </div>
                        <p className="text-[13px] md:text-base font-semibold text-slate-800 mb-2 leading-snug">{cp.description}</p>
                        <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5 w-fit">
                          <Icon name="BookOpen" size={12} />
                          <span className="font-medium">{cp.standard} • {cp.standard_clause}</span>
                        </div>
                      </div>
                    
                    <div className="flex gap-2 w-full mt-3">
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'compliant' ? 'default' : 'outline'}
                        className={cn(
                          'flex-1 text-xs md:text-sm h-10 md:h-11 rounded-xl font-semibold transition-all',
                          checkpoint?.status === 'compliant' 
                            ? 'bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md' 
                            : 'hover:bg-green-50 hover:border-green-300'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'compliant')}
                      >
                        <Icon name="Check" size={16} className="mr-1.5" />
                        <span className="hidden sm:inline">Соответствует</span>
                        <span className="sm:hidden">✓</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={checkpoint?.status === 'non_compliant' ? 'default' : 'outline'}
                        className={cn(
                          'flex-1 text-xs md:text-sm h-10 md:h-11 rounded-xl font-semibold transition-all',
                          checkpoint?.status === 'non_compliant' 
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-sm hover:shadow-md' 
                            : 'hover:bg-amber-50 hover:border-amber-300'
                        )}
                        onClick={() => handleCheckpointStatusChange(cp.id, 'non_compliant')}
                      >
                        <Icon name="X" size={16} className="mr-1.5" />
                        <span className="hidden sm:inline">Не соответствует</span>
                        <span className="sm:hidden">✗</span>
                      </Button>
                    </div>
                    </div>
                    
                    {isNonCompliant && checkpoint.defect && (
                      <div className="mt-4 pt-4 border-t-2 border-amber-200 space-y-3.5 bg-amber-50/50 -mx-3.5 md:-mx-5 px-3.5 md:px-5 pb-3.5 md:pb-5 rounded-b-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center">
                            <Icon name="AlertTriangle" size={14} className="text-amber-700" />
                          </div>
                          <span className="text-xs md:text-sm font-bold text-amber-900">Добавить замечание</span>
                        </div>
                        
                        <div>
                          <Label className="text-xs md:text-sm font-semibold text-slate-700 mb-1.5 block">
                            Описание замечания <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            placeholder="Опишите выявленное несоответствие..."
                            value={checkpoint.defect.description}
                            onChange={(e) => handleDefectChange(cp.id, 'description', e.target.value)}
                            rows={3}
                            className="mt-1.5 text-sm rounded-xl border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs md:text-sm font-semibold text-slate-700 mb-1.5 block">
                            Ссылка на норматив <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="СНиП 3.03.01-87, п. 4.5"
                            value={checkpoint.defect.standard_reference}
                            onChange={(e) => handleDefectChange(cp.id, 'standard_reference', e.target.value)}
                            className="mt-1.5 text-sm rounded-xl border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs md:text-sm font-semibold text-slate-700 mb-1.5 block">Фотофиксация</Label>
                          <div className="mt-1.5 border-2 border-dashed border-amber-300 rounded-xl p-4 md:p-5 text-center bg-white hover:bg-amber-50/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2.5">
                              <Icon name="Camera" size={20} className="text-amber-600" />
                            </div>
                            <p className="text-[11px] md:text-xs text-slate-600 mb-3">Прикрепите фото дефекта</p>
                            <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg border-amber-300 hover:bg-amber-100">
                              <Icon name="Upload" size={14} className="mr-1.5" />
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
        </div>

        <DialogFooter className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-sm border-t-2 border-slate-200 p-4 md:p-5 flex-row gap-2.5 md:gap-3 shadow-lg rounded-b-2xl">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 md:flex-none h-11 md:h-12 rounded-xl font-semibold border-2 hover:bg-slate-50"
          >
            <Icon name="X" size={16} className="mr-2 md:hidden" />
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-1 md:flex-auto h-11 md:h-12 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Icon name="CheckCircle" size={18} className="mr-2" />
            <span className="hidden md:inline">Создать проверку</span>
            <span className="md:hidden">Создать</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}