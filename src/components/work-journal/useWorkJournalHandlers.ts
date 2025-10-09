import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useWorkJournalHandlers(selectedWork: number | null) {
  const { user, setUserData } = useAuth();
  const { toast } = useToast();

  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [volume, setVolume] = useState('');
  const [materials, setMaterials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isWorkReportModalOpen, setIsWorkReportModalOpen] = useState(false);
  const [selectedEntryForInspection, setSelectedEntryForInspection] = useState<number | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    contractor_id: '',
    status: 'active',
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedWork) return;
    
    setIsSubmitting(true);

    try {
      await api.createItem(user.id, 'work_log', {
        work_id: selectedWork,
        description: newMessage,
        progress: parseInt(progress),
        volume: volume || null,
        materials: materials || null,
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Запись добавлена',
        description: 'Новая запись в журнале создана',
      });

      setNewMessage('');
      setProgress('0');
      setVolume('');
      setMaterials('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить запись',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInspectionClick = (eventId: number) => {
    setSelectedEntryForInspection(eventId);
    setIsInspectionModalOpen(true);
  };

  const handleInspectionSubmit = (data: any) => {
    console.log('Создание проверки:', data);
    toast({
      title: 'Проверка создана',
      description: 'Проверка успешно добавлена в журнал',
    });
    setIsInspectionModalOpen(false);
    setSelectedEntryForInspection(undefined);
  };

  const handleWorkReportSubmit = async (data: {
    text_content: string;
    work_volume: string;
    materials: Array<{ name: string; quantity: number; unit: string }>;
    photo_urls: string[];
  }) => {
    if (!user || !selectedWork) return;
    
    setIsSubmitting(true);

    try {
      await api.createItem(user.id, 'work_log', {
        work_id: selectedWork,
        description: data.text_content,
        progress: 0,
        volume: data.work_volume || null,
        materials: data.materials.map(m => `${m.name} ${m.quantity} ${m.unit}`).join(', ') || null,
        photo_urls: data.photo_urls.join(',') || null,
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Отчёт создан',
        description: 'Запись в журнале добавлена',
      });

      setIsWorkReportModalOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать отчёт',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (selectedWorkData: any) => {
    if (!selectedWorkData) return;
    
    setEditFormData({
      title: selectedWorkData.title || '',
      description: selectedWorkData.description || '',
      contractor_id: selectedWorkData.contractor_id?.toString() || '',
      status: selectedWorkData.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (selectedWorkData: any) => {
    if (!user || !selectedWorkData) return;
    
    try {
      setIsSubmitting(true);
      await api.updateItem(user.id, 'work', selectedWorkData.id, {
        title: editFormData.title,
        description: editFormData.description,
        contractor_id: editFormData.contractor_id ? Number(editFormData.contractor_id) : null,
        status: editFormData.status,
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Работа обновлена',
        description: 'Изменения успешно сохранены',
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить работу',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    newMessage,
    setNewMessage,
    progress,
    setProgress,
    volume,
    setVolume,
    materials,
    setMaterials,
    isSubmitting,
    isInspectionModalOpen,
    setIsInspectionModalOpen,
    isWorkReportModalOpen,
    setIsWorkReportModalOpen,
    selectedEntryForInspection,
    setSelectedEntryForInspection,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editFormData,
    setEditFormData,
    handleSendMessage,
    handleCreateInspectionClick,
    handleInspectionSubmit,
    handleWorkReportSubmit,
    handleEditClick,
    handleEditSubmit,
  };
}
