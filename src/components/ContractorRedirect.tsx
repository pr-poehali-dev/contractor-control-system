import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import Icon from '@/components/ui/icon';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

const ContractorRedirect = () => {
  const { user } = useAuthRedux();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkContractorWorks = async () => {
      if (user?.role !== 'contractor') {
        setIsChecking(false);
        return;
      }

      try {
        const response = await apiClient.get(`${ENDPOINTS.OBJECTS.LIST}?contractor_id=${user.id}`);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to load objects');
        }

        const objects = response.data?.objects || [];

        if (objects.length === 1) {
          const singleObject = objects[0];
          navigate(`/projects/${singleObject.project_id}/objects/${singleObject.id}`);
        } else if (objects.length > 1) {
          navigate('/objects');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Failed to check contractor works:', error);
        setIsChecking(false);
      }
    };

    checkContractorWorks();
  }, [user, navigate]);

  if (!isChecking) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Icon name="Loader2" size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">Загрузка...</p>
      </div>
    </div>
  );
};

export default ContractorRedirect;