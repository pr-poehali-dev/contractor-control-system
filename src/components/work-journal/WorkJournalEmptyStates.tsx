import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/constants/routes';

export function NoWorksEmptyState({ objectId }: { objectId: number }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Icon name="Briefcase" size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Пока нет работ</h3>
        <p className="text-slate-600 mb-6">Создайте первую работу для этого объекта</p>
        <Button onClick={() => navigate(ROUTES.WORK_CREATE(objectId))}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать работу
        </Button>
      </div>
    </div>
  );
}

export function NoWorkSelectedEmptyState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Работа не выбрана</p>
    </div>
  );
}

export function NoJournalEntriesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Icon name="MessageSquare" size={40} className="text-blue-400" />
      </div>
      <p className="text-slate-500 text-base mb-2">Записей пока нет</p>
      <p className="text-slate-400 text-sm">Начните вести журнал работ</p>
    </div>
  );
}