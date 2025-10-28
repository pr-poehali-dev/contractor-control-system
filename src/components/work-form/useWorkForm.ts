import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadUserData } from '@/store/slices/userSlice';
import { useToast } from '@/hooks/use-toast';
import { updateObject } from '@/store/slices/objectsSlice';
import { createWork, updateWork as updateWorkAction } from '@/store/slices/worksSlice';
import { WorkForm, emptyWork } from './types';
import { ROUTES } from '@/constants/routes';

interface ObjectData {
  id: number | null;
  name: string;
  address: string;
  customer: string;
  description: string;
  photo_url?: string;
}

export const useWorkForm = (objectId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuthRedux();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user.userData);
  const [works, setWorks] = useState<WorkForm[]>([]);
  const [objectData, setObjectData] = useState<ObjectData>({
    id: null,
    name: '',
    address: '',
    customer: '',
    description: '',
    photo_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  const contractors = userData?.contractors || [];
  const workTemplates = userData?.work_templates || [];
  const categories = Array.from(new Set(workTemplates.map((t: any) => t.category).filter(Boolean)));

  useEffect(() => {
    if (!objectId || !token) return;
    
    if (!userData) {
      console.log('🔍 Loading user data...');
      setIsLoading(true);
      dispatch(loadUserData(token));
    } else if (!isInitialized.current) {
      console.log('🔍 User data already loaded, processing works...');
      processWorks();
      isInitialized.current = true;
    }
  }, [objectId, token, userData]);

  const processWorks = () => {
    if (!userData || !objectId) return;
    
    const freshTemplates = userData.work_templates || [];
    const freshObjects = userData.objects || [];
    const currentObject = freshObjects.find((obj: any) => obj.id === Number(objectId));
    
    console.log('🏢 Current object:', currentObject);
    console.log('🏢 Object ID:', objectId, 'Type:', typeof objectId);
    console.log('🏢 Available objects:', freshObjects.map((o: any) => ({ id: o.id, name: o.name })));
    
    if (currentObject) {
      const newObjectData = {
        id: currentObject.id,
        name: currentObject.title || currentObject.name || '',
        address: currentObject.address || '',
        customer: currentObject.customer || '',
        description: currentObject.description || '',
        photo_url: currentObject.photo_url || '',
      };
      console.log('✅ Setting object data:', newObjectData);
      setObjectData(newObjectData);
    }
    
    const objectWorks = currentObject?.works || [];
    
    console.log('🔍 Filtered works for object', objectId, ':', objectWorks);
    console.log('🔍 Available templates:', freshTemplates.length);
    
    if (objectWorks.length > 0) {
      const existingWorks = objectWorks.map((work: any) => {
        const template = freshTemplates.find((t: any) => t.title === work.title);
        return {
          id: `existing-${work.id}`,
          workId: work.id,
          category: template?.category || '',
          title: work.title || '',
          volume: '',
          unit: 'м²',
          planned_start_date: work.planned_start_date?.split('T')[0] || '',
          planned_end_date: work.planned_end_date?.split('T')[0] || '',
          contractor_id: work.contractor_id ? String(work.contractor_id) : '',
          isExisting: true,
        };
      });
      
      console.log('✅ Setting works with existing:', existingWorks);
      setWorks(existingWorks);
    } else {
      setWorks([]);
    }
    
    setIsLoading(false);
  };

  const addWork = () => {
    setWorks([...works, { ...emptyWork, id: crypto.randomUUID() }]);
  };

  const removeWork = (id: string) => {
    const work = works.find(w => w.id === id);
    
    if (work?.isExisting) {
      toast({
        title: 'Нельзя удалить',
        description: 'Существующие работы нельзя удалить здесь. Перейдите в карточку работы.',
        variant: 'destructive',
      });
      return;
    }
    
    setWorks(works.filter(w => w.id !== id));
  };

  const duplicateWork = (id: string) => {
    const work = works.find(w => w.id === id);
    if (work) {
      const newWork = { 
        ...work, 
        id: crypto.randomUUID(), 
        isExisting: false,
        workId: undefined,
      };
      const index = works.findIndex(w => w.id === id);
      const newWorks = [...works];
      newWorks.splice(index + 1, 0, newWork);
      setWorks(newWorks);
    }
  };

  const updateWork = (id: string, field: keyof WorkForm, value: string | boolean) => {
    console.log(`🔄 Updating work ${id}, field: ${field}, value:`, value);
    const updatedWorks = works.map(w => {
      if (w.id === id) {
        const updated = { ...w, [field]: value };
        console.log(`✅ Updated work:`, updated);
        return updated;
      }
      return w;
    });
    console.log(`📋 All works after update:`, updatedWorks);
    setWorks(updatedWorks);
  };

  const updateObjectField = (field: keyof ObjectData, value: string) => {
    setObjectData(prev => ({ ...prev, [field]: value }));
  };

  const saveObject = async () => {
    if (!objectData.id || !token) return;

    setIsSubmitting(true);
    try {
      await dispatch(updateObject({
        id: objectData.id,
        data: {
          title: objectData.name,
          address: objectData.address,
          customer: objectData.customer,
          description: objectData.description,
        }
      })).unwrap();

      await dispatch(loadUserData(token)).unwrap();

      toast({
        title: 'Объект обновлён!',
        description: 'Информация об объекте успешно сохранена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить объект',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newWorks = works.filter(w => !w.isExisting);
    const existingWorks = works.filter(w => w.isExisting);

    if (newWorks.length === 0 && existingWorks.length === 0) {
      toast({
        title: 'Нет работ',
        description: 'Добавьте хотя бы одну работу',
        variant: 'destructive',
      });
      return;
    }

    const invalidWorks = newWorks.filter(w => !w.category.trim() || !w.title.trim());
    if (invalidWorks.length > 0) {
      toast({
        title: 'Ошибка валидации',
        description: 'Укажите категорию и название для всех новых работ',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !objectId || !token) return;

    setIsSubmitting(true);

    try {
      for (const work of newWorks) {
        await dispatch(createWork({
          object_id: Number(objectId),
          title: work.title,
          contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
          status: 'active',
          planned_start_date: work.planned_start_date || null,
          planned_end_date: work.planned_end_date || null,
        })).unwrap();
      }

      for (const work of existingWorks) {
        if (work.workId) {
          await dispatch(updateWorkAction({
            id: work.workId,
            data: {
              title: work.title,
              contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
              planned_start_date: work.planned_start_date || null,
              planned_end_date: work.planned_end_date || null,
            }
          })).unwrap();
        }
      }

      await dispatch(loadUserData(token)).unwrap();

      toast({
        title: 'Работы сохранены!',
        description: `Добавлено новых работ: ${newWorks.length}, обновлено: ${existingWorks.length}`,
      });

      setTimeout(() => {
        navigate(ROUTES.OBJECT_DETAIL(Number(objectId)));
      }, 500);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить работы',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/objects/${objectId}`);
    }
  };

  return {
    works,
    objectData,
    isLoading,
    isSubmitting,
    contractors,
    workTemplates,
    categories,
    addWork,
    removeWork,
    duplicateWork,
    updateWork,
    updateObjectField,
    saveObject,
    handleSubmit,
    handleCancel,
  };
};