import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface WorkType {
  id: number;
  name: string;
  description?: string;
  unit: string;
  category?: string;
  created_at: string;
}

interface NewWorkType {
  name: string;
  description: string;
  unit: string;
  category: string;
}

interface AdminWorkTypesProps {
  workTypes: WorkType[];
  loading: boolean;
  showAddWorkType: boolean;
  newWorkType: NewWorkType;
  onToggleAddForm: () => void;
  onNewWorkTypeChange: (workType: NewWorkType) => void;
  onAddWorkType: () => void;
}

export default function AdminWorkTypes({
  workTypes,
  loading,
  showAddWorkType,
  newWorkType,
  onToggleAddForm,
  onNewWorkTypeChange,
  onAddWorkType,
}: AdminWorkTypesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onToggleAddForm}>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить тип работы
        </Button>
      </div>

      {showAddWorkType && (
        <Card>
          <CardHeader>
            <CardTitle>Новый тип работы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkType.name}
                  onChange={(e) => onNewWorkTypeChange({ ...newWorkType, name: e.target.value })}
                  placeholder="Например: Кладка кирпича"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Единица измерения <span className="text-red-500">*</span>
                </label>
                <select
                  value={newWorkType.unit}
                  onChange={(e) => onNewWorkTypeChange({ ...newWorkType, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="м²">м²</option>
                  <option value="м³">м³</option>
                  <option value="м">м</option>
                  <option value="шт">шт</option>
                  <option value="т">т</option>
                  <option value="кг">кг</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Категория
                </label>
                <input
                  type="text"
                  value={newWorkType.category}
                  onChange={(e) => onNewWorkTypeChange({ ...newWorkType, category: e.target.value })}
                  placeholder="Например: Кладочные работы"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Описание
                </label>
                <input
                  type="text"
                  value={newWorkType.description}
                  onChange={(e) => onNewWorkTypeChange({ ...newWorkType, description: e.target.value })}
                  placeholder="Краткое описание"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={onAddWorkType}>
                Сохранить
              </Button>
              <Button variant="outline" onClick={onToggleAddForm}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Название</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Категория</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Единица</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Описание</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <Icon name="Loader2" size={32} className="animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : workTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">
                      Типы работ не найдены
                    </td>
                  </tr>
                ) : (
                  workTypes.map(wt => (
                    <tr key={wt.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm text-slate-700">{wt.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-900">{wt.name}</td>
                      <td className="p-4 text-sm text-slate-600">{wt.category || '-'}</td>
                      <td className="p-4">
                        <Badge variant="secondary">{wt.unit}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{wt.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
