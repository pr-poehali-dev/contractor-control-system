import Icon from '@/components/ui/icon';

export const InfoSection = () => {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-blue-900">💡 Советы по заполнению</p>
          <ul className="space-y-1 text-blue-800">
            <li>📋 <strong>Объём:</strong> Укажите количество работ для контроля выполнения</li>
            <li>📅 <strong>Сроки:</strong> Учитывайте время на согласования и проверки</li>
            <li>👷 <strong>Подрядчик:</strong> Можно назначить сразу или позже</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
