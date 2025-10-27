import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PRESET_TEMPLATES } from './pdf-presets';

interface TemplatePresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPreset: (presetKey: keyof typeof PRESET_TEMPLATES) => void;
}

export function TemplatePresetsDialog({ 
  open, 
  onOpenChange, 
  onSelectPreset 
}: TemplatePresetsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-shrink-0">
          <Icon name="Layout" size={16} className="mr-2" />
          Шаблоны
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Выберите готовый шаблон</DialogTitle>
          <DialogDescription>
            Загрузите шаблон и настройте его под ваши задачи
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {Object.entries(PRESET_TEMPLATES).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onSelectPreset(key as keyof typeof PRESET_TEMPLATES)}
              className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                  <Icon name={preset.icon as any} size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500">
                    {preset.schemas[0].length} полей
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
