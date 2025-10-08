import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SubtasksTabProps {
  handleAddSubtask: () => void;
}

const mockSubtasks = [
  { id: 1, title: 'Подготовка основания', status: 'completed', assignee: 'Иван П.' },
  { id: 2, title: 'Укладка материала', status: 'active', assignee: 'Петр И.' },
  { id: 3, title: 'Финишная отделка', status: 'pending', assignee: 'Сергей М.' },
];

export default function SubtasksTab({ handleAddSubtask }: SubtasksTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Подзадачи ({mockSubtasks.length})</h3>
          <Button size="sm" onClick={handleAddSubtask}>
            <Icon name="Plus" size={16} className="mr-1" />
            Добавить подзадачу
          </Button>
        </div>

        <div className="space-y-3">
          {mockSubtasks.map((subtask) => (
            <Card key={subtask.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    {subtask.status === 'completed' ? (
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="Check" size={14} className="text-green-600" />
                      </div>
                    ) : subtask.status === 'active' ? (
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        'font-medium text-sm',
                        subtask.status === 'completed' && 'line-through text-slate-500'
                      )}>
                        {subtask.title}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1">
                        <Icon name="MoreVertical" size={14} />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {subtask.status === 'completed' ? '✅ Готово' : subtask.status === 'active' ? '🟢 В работе' : '🟡 Ожидание'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Icon name="User" size={12} />
                        {subtask.assignee}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Подсказка:</strong> Разбивайте большие работы на подзадачи для лучшего контроля прогресса
          </p>
        </div>
      </div>
    </div>
  );
}