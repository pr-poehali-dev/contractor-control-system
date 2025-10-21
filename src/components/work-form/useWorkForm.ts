import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadUserData } from '@/store/slices/userSlice';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { WorkForm, emptyWork } from './types';

export const useWorkForm = (objectId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user.userData);
  const [works, setWorks] = useState<WorkForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const contractors = userData?.contractors || [];
  const workTemplates = userData?.work_templates || [];
  const categories = Array.from(new Set(workTemplates.map((t: any) => t.category).filter(Boolean)));

  useEffect(() => {
    if (!objectId || !token) return;
    
    if (!userData) {
      console.log('🔍 Loading user data...');
      setIsLoading(true);
      dispatch(loadUserData(token));
    } else {
      console.log('🔍 User data already loaded, processing works...');
      processWorks();
    }
  }, [objectId, token, userData]);

  const processWorks = () => {
    if (!userData || !objectId) return;
    
    const freshWorks = userData.works || [];
    const objectWorks = freshWorks.filter((work: any) => work.object_id === Number(objectId));
    
    console.log('🔍 Filtered works for object', objectId, ':', objectWorks);
    
    if (objectWorks.length > 0) {
      const existingWorks = objectWorks.map((work: any) => ({
        id: `existing-${work.id}`,
        workId: work.id,
        category: '',
        title: work.title || '',
        volume: '',
        unit: 'м²',
        planned_start_date: work.planned_start_date?.split('T')[0] || '',
        planned_end_date: work.planned_end_date?.split('T')[0] || '',
        contractor_id: work.contractor_id ? String(work.contractor_id) : '',
        isExisting: true,
      }));
      
      console.log('✅ Setting works with existing:', existingWorks);
      setWorks([...existingWorks, { ...emptyWork, id: crypto.randomUUID() }]);
    } else {
      console.log('ℹ️ No existing works for this object, setting empty work');
      setWorks([{ ...emptyWork, id: crypto.randomUUID() }]);
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

    const newWorks = works.filter(w => !w.isExisting);
    if (newWorks.length === 1) {
      toast({
        title: 'Ошибка',
        description: 'Должна быть хотя бы одна новая работа',
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
    setWorks(works.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newWorks = works.filter(w => !w.isExisting);
    const existingWorks = works.filter(w => w.isExisting);

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
        await api.createItem(token, 'work', {
          object_id: Number(objectId),
          title: work.title,
          contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
          status: 'active',
          planned_start_date: work.planned_start_date || null,
          planned_end_date: work.planned_end_date || null,
        });
      }

      for (const work of existingWorks) {
        if (work.workId) {
          await api.updateItem(token, 'work', work.workId, {
            title: work.title,
            contractor_id: work.contractor_id ? Number(work.contractor_id) : null,
            planned_start_date: work.planned_start_date || null,
            planned_end_date: work.planned_end_date || null,
          });
        }
      }

      await dispatch(loadUserData(token)).unwrap();

      toast({
        title: 'Работы сохранены!',
        description: `Добавлено новых работ: ${newWorks.length}, обновлено: ${existingWorks.length}`,
      });

      setTimeout(() => {
        navigate(`/objects/${objectId}`);
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
    navigate(`/objects/${objectId}`);
  };

  return {
    works,
    isLoading,
    isSubmitting,
    contractors,
    workTemplates,
    categories,
    addWork,
    removeWork,
    duplicateWork,
    updateWork,
    handleSubmit,
    handleCancel,
  };
};
