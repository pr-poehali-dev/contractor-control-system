import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/store/hooks';
import {
  signDocument,
  createSignatureRequest,
  updateDocument,
  deleteDocument,
  fetchDocumentDetail,
} from '@/store/slices/documentsSlice';
import { useNavigate } from 'react-router-dom';

export const useDocumentHandlers = (documentId: number, user: any, document: any) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectMethod = async (method: 'sms' | 'ecp') => {
    const currentSignature = document?.signatures?.find((sig: any) => sig.signer_id === user?.id);
    
    if (!currentSignature) {
      await dispatch(createSignatureRequest({
        document_id: documentId,
        signer_id: user?.id || 0,
        signature_type: method,
      }));
      dispatch(fetchDocumentDetail(documentId));
    }
    
    return method;
  };

  const handleSmsSign = async (code: string) => {
    const currentSignature = document?.signatures?.find((sig: any) => sig.signer_id === user?.id);
    if (!currentSignature) return;
    
    await dispatch(signDocument({
      signature_id: currentSignature.id,
      action: 'sign',
      signature_data: `SMS:${code}:${new Date().toISOString()}`,
    }));
    
    toast({
      title: 'Документ подписан',
      description: 'Подпись успешно добавлена',
    });
    
    dispatch(fetchDocumentDetail(documentId));
  };

  const handleEcpSign = async (certificateData: string) => {
    const currentSignature = document?.signatures?.find((sig: any) => sig.signer_id === user?.id);
    if (!currentSignature) return;
    
    await dispatch(signDocument({
      signature_id: currentSignature.id,
      action: 'sign',
      signature_data: certificateData,
    }));
    
    toast({
      title: 'Документ подписан',
      description: 'ЭЦП успешно добавлена',
    });
    
    dispatch(fetchDocumentDetail(documentId));
  };

  const handleReject = async (signatureId: number) => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) return;

    await dispatch(signDocument({
      signature_id: signatureId,
      action: 'reject',
      rejection_reason: reason,
    }));
    
    dispatch(fetchDocumentDetail(documentId));
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) return;
    
    try {
      await dispatch(deleteDocument(documentId)).unwrap();
      toast({
        title: 'Документ удалён',
        description: 'Документ успешно удалён',
      });
      navigate('/documents');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить документ',
        variant: 'destructive',
      });
    }
  };

  const handleSaveData = async (data: Record<string, any>) => {
    try {
      await dispatch(updateDocument({
        id: documentId,
        contentData: data,
      })).unwrap();

      toast({
        title: 'Данные сохранены',
        description: 'Документ успешно обновлён',
      });

      dispatch(fetchDocumentDetail(documentId));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    }
  };

  const handleSendToSignature = async () => {
    try {
      await dispatch(updateDocument({
        id: documentId,
        status: 'pending_signature',
      })).unwrap();

      toast({
        title: 'Документ отправлен',
        description: 'Документ отправлен на подписание',
      });

      dispatch(fetchDocumentDetail(documentId));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить документ',
        variant: 'destructive',
      });
    }
  };

  return {
    handleSelectMethod,
    handleSmsSign,
    handleEcpSign,
    handleReject,
    handleDelete,
    handleSaveData,
    handleSendToSignature,
  };
};