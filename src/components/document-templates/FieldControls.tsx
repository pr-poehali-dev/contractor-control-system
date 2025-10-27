import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldControlsProps {
  fieldType: string;
  fieldName: string;
  onFieldTypeChange: (value: string) => void;
  onFieldNameChange: (value: string) => void;
  onAddField: () => void;
  onAddPage: () => void;
  onRemovePage: () => void;
}

export function FieldControls({
  fieldType,
  fieldName,
  onFieldTypeChange,
  onFieldNameChange,
  onAddField,
  onAddPage,
  onRemovePage,
}: FieldControlsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold">Добавить поле</Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Тип поля</Label>
            <Select value={fieldType} onValueChange={onFieldTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Icon name="Type" size={14} />
                    Текст
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Icon name="Image" size={14} />
                    Изображение
                  </div>
                </SelectItem>
                <SelectItem value="qrcode">
                  <div className="flex items-center gap-2">
                    <Icon name="QrCode" size={14} />
                    QR-код
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs text-gray-600">Имя поля</Label>
            <Input
              value={fieldName}
              onChange={(e) => onFieldNameChange(e.target.value)}
              placeholder="Например: company_name"
              onKeyDown={(e) => e.key === 'Enter' && onAddField()}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={onAddField} 
              className="w-full"
              disabled={!fieldName.trim()}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={onAddPage} variant="outline" size="sm">
            <Icon name="FilePlus" size={16} className="mr-2" />
            Добавить страницу
          </Button>
          <Button onClick={onRemovePage} variant="outline" size="sm">
            <Icon name="FileX" size={16} className="mr-2" />
            Удалить страницу
          </Button>
        </div>
      </div>
    </Card>
  );
}
