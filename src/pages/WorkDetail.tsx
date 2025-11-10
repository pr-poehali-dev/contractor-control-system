import { useNavigate, useParams } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import WorkJournal from '@/components/WorkJournal';
import { ROUTES } from '@/constants/routes';
import styles from './WorkDetail.module.css';

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
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className={styles.errorContainer}>
        <Button variant="ghost" onClick={() => navigate(ROUTES.OBJECT_DETAIL(Number(objectId)))}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К объекту
        </Button>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>Работа не найдена</p>
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