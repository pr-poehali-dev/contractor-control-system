import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { WorkTemplateFormData, ControlPoint } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';

const CATEGORIES = [
  'Кровельные работы',
  'Оконные и дверные работы',
  'Системы отопления',
  'Вентиляция и кондиционирование',
  'Фасадные работы',
  'Электромонтажные работы',
  'Гидроизоляция и подвалы',
  'Водоотведение',
  'Благоустройство территории',
  'Приборы учета',
  'Общестроительные работы',
];

interface WorkTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: WorkTemplateFormData;
  onFormDataChange: (data: WorkTemplateFormData) => void;
  onSubmit: () => void;
  submitLabel: string;
}

const WorkTemplateFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  formData,
  onFormDataChange,
  onSubmit,
  submitLabel,
}: WorkTemplateFormDialogProps) => {
  const handleAddControlPoint = () => {
    const newPoint: ControlPoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: '',
      standard: '',
      standard_clause: '',
      is_critical: false,
    };
    onFormDataChange({
      ...formData,
      control_points: [...(formData.control_points || []), newPoint],
    });
  };

  const handleUpdateControlPoint = (
    id: string,
    field: keyof ControlPoint,
    value: string | boolean
  ) => {
    const updated = formData.control_points.map((cp) =>
      cp.id === id ? { ...cp, [field]: value } : cp
    );
    onFormDataChange({ ...formData, control_points: updated });
  };

  const handleDeleteControlPoint = (id: string) => {
    onFormDataChange({
      ...formData,
      control_points: formData.control_points.filter((cp) => cp.id !== id),
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название работы *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
              placeholder="Например: Устройство кровли из металлочерепицы"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Код работы (ФЕР/ЕНиР)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                onFormDataChange({ ...formData, code: e.target.value })
              }
              placeholder="ФЕР12-01-007-01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание работы</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Монтаж кровельного покрытия из металлочерепицы на обрешётку с креплением саморезами, включая установку коньков, ендов, снегозадержателей. Контроль: Уклон кровли ≥ 14°, нахлёст листов..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="normative_ref">
              Нормативная база (ГОСТ, СП, СНиП)
            </Label>
            <Input
              id="normative_ref"
              value={formData.normative_ref}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  normative_ref: e.target.value,
                })
              }
              placeholder="СП 17.13330.2017 «Кровли», ГОСТ 24045-2016"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material_types">Типовые материалы</Label>
            <Textarea
              id="material_types"
              value={formData.material_types}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  material_types: e.target.value,
                })
              }
              placeholder="металлочерепица, деревянная обрешётка, саморезы с уплотнителем"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Категория работ</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Контрольные точки проверки</Label>
                <p className="text-sm text-slate-500 mt-1">
                  Пункты для проверки соответствия при приёмке работ
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddControlPoint}
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </div>

            {formData.control_points?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Icon
                    name="ClipboardList"
                    size={32}
                    className="mx-auto text-slate-300 mb-2"
                  />
                  <p className="text-sm text-slate-500">
                    Контрольные точки не добавлены
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.control_points?.map((cp, index) => (
                  <Card key={cp.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`critical_${cp.id}`}
                              checked={cp.is_critical}
                              onCheckedChange={(checked) =>
                                handleUpdateControlPoint(
                                  cp.id,
                                  'is_critical',
                                  checked === true
                                )
                              }
                            />
                            <Label
                              htmlFor={`critical_${cp.id}`}
                              className="text-xs cursor-pointer"
                            >
                              Критичная
                            </Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteControlPoint(cp.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Описание требования *</Label>
                        <Textarea
                          value={cp.description}
                          onChange={(e) =>
                            handleUpdateControlPoint(
                              cp.id,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Например: Уклон кровли должен соответствовать проекту"
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Норматив *</Label>
                          <Input
                            value={cp.standard}
                            onChange={(e) =>
                              handleUpdateControlPoint(
                                cp.id,
                                'standard',
                                e.target.value
                              )
                            }
                            placeholder="СП 17.13330.2017"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Пункт норматива *</Label>
                          <Input
                            value={cp.standard_clause}
                            onChange={(e) =>
                              handleUpdateControlPoint(
                                cp.id,
                                'standard_clause',
                                e.target.value
                              )
                            }
                            placeholder="п. 5.2.1"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkTemplateFormDialog;