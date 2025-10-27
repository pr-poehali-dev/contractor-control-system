import { useNavigate, useParams } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import WorkJournal from '@/components/WorkJournal';

const WorkDetail = () => {
  const { objectId, workId } = useParams();
  const navigate = useNavigate();
  const { isLoading, userData } = useAuthRedux();
  
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const currentObject = objects.find(o => o.id === Number(objectId));
  const works = currentObject?.works || [];
  const work = works.find(w => w.id === Number(workId));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(`/objects/${objectId}`)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К объекту
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Работа не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <WorkJournal 
      objectId={Number(objectId)} 
      selectedWorkId={Number(workId)}
    />
  );
};

export default WorkDetail;