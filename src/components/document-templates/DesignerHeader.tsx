import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { TemplatePresetsDialog } from './TemplatePresetsDialog';
import { PRESET_TEMPLATES } from './pdf-presets';

interface DesignerHeaderProps {
  showPresets: boolean;
  onShowPresetsChange: (show: boolean) => void;
  onLoadPreset: (presetKey: keyof typeof PRESET_TEMPLATES) => void;
}

export function DesignerHeader({ 
  showPresets, 
  onShowPresetsChange, 
  onLoadPreset 
}: DesignerHeaderProps) {
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Icon name="Sparkles" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 text-sm text-blue-900 flex-1">
          <p className="font-semibold">PDF редактор документов</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Используйте готовые шаблоны или создайте свой</li>
            <li>Перетаскивайте элементы и изменяйте их размер</li>
            <li>Настраивайте свойства элементов в боковой панели</li>
          </ul>
        </div>
        <TemplatePresetsDialog
          open={showPresets}
          onOpenChange={onShowPresetsChange}
          onSelectPreset={onLoadPreset}
        />
      </div>
    </Card>
  );
}
