import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDocumentDetail,
  createSignatureRequest,
  signDocument,
  updateDocument,
  deleteDocument,
  selectCurrentDocument,
  selectDocumentsLoading,
} from '@/store/slices/documentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DocumentEditor from './DocumentEditor';
import SignatureMethodDialog from './SignatureMethodDialog';
import SmsSignatureDialog from './SmsSignatureDialog';
import EcpSignatureDialog from './EcpSignatureDialog';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  documentId: number;
}

export default function DocumentViewer({ documentId }: DocumentViewerProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const document = useAppSelector(selectCurrentDocument);
  const loading = useAppSelector(selectDocumentsLoading);
  const user = useAppSelector((state) => state.user.user);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showSignatureMethod, setShowSignatureMethod] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showEcpDialog, setShowEcpDialog] = useState(false);
  const [selectedSignatureType, setSelectedSignatureType] = useState<'sms' | 'ecp' | null>(null);

  useEffect(() => {
    dispatch(fetchDocumentDetail(documentId));
  }, [dispatch, documentId]);

  // Открываем редактор только если в URL есть параметр edit=true
  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit) {
      setIsEditing(true);
      // Убираем параметр из URL после открытия редактора
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleRequestSignature = () => {
    setShowSignatureMethod(true);
  };

  const handleSelectMethod = async (method: 'sms' | 'ecp') => {
    setSelectedSignatureType(method);
    setShowSignatureMethod(false);
    
    const currentSignature = document?.signatures?.find(sig => sig.signer_id === user?.id);
    
    if (!currentSignature) {
      await dispatch(createSignatureRequest({
        document_id: documentId,
        signer_id: user?.id || 0,
        signature_type: method,
      }));
      dispatch(fetchDocumentDetail(documentId));
    }
    
    if (method === 'sms') {
      setShowSmsDialog(true);
    } else {
      setShowEcpDialog(true);
    }
  };

  const handleSmsSign = async (code: string) => {
    const currentSignature = document?.signatures?.find(sig => sig.signer_id === user?.id);
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
    const currentSignature = document?.signatures?.find(sig => sig.signer_id === user?.id);
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
    console.log('📤 DocumentViewer handleSaveData called with data:', data);
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

  const extractVariables = (html: string): string[] => {
    // Извлекаем переменные в формате {{key}} и [key]
    const matches1 = html.match(/{{([^}]+)}}/g) || [];
    const matches2 = html.match(/\[([^\]]+)\]/g) || [];
    const allMatches = [...matches1, ...matches2];
    
    if (allMatches.length === 0) return [];
    
    const variables = allMatches.map(m => 
      m.replace(/[{}\[\]]/g, '').trim()
    );
    
    return [...new Set(variables)];
  };

  const replaceVariables = (html: string, data: Record<string, any>): string => {
    let result = html;
    Object.entries(data).forEach(([key, value]) => {
      // Заменяем переменные в формате [key]
      const regex1 = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(regex1, String(value || ''));
      
      // Заменяем переменные в формате {{key}}
      const regex2 = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex2, String(value || ''));
    });
    return result;
  };

  const handleDownloadPDF = () => {
    const content = replaceVariables(document?.htmlContent || '', document?.contentData || {});

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${document?.title || 'Документ'}</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 40px; 
                line-height: 1.6;
                color: #000;
              }
              h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
              p { margin: 0.5em 0; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (loading && !document) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="FileX" size={64} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Документ не найден</p>
        </CardContent>
      </Card>
    );
  }

  const canSign = document.signatures?.some(
    sig => sig.signer_id === user?.id && sig.status === 'pending'
  );

  const mySignature = document.signatures?.find(sig => sig.signer_id === user?.id);

  if (isEditing) {
    // Извлекаем переменные из HTML шаблона, а не из contentData
    const variableKeys = extractVariables(document.htmlContent || '');
    
    return (
      <DocumentEditor
        htmlContent={document.htmlContent || ''}
        variables={variableKeys}
        contentData={document.contentData || {}}
        onSave={(data) => {
          handleSaveData(data);
        }}
        onDownload={handleDownloadPDF}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const documentHtml = replaceVariables(document.htmlContent || '', document.contentData || {});

  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-6">
      <div className="bg-white rounded-lg border shadow-sm p-8 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: documentHtml || 'Нет содержимого' }} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-xl">{document.title}</CardTitle>
              {document.status === 'draft' && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">Черновик</Badge>
              )}
              {document.status === 'pending_signature' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">На подписи</Badge>
              )}
              {document.status === 'signed' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Подписан</Badge>
              )}
            </div>
            {document.document_number && (
              <p className="text-sm text-slate-500">{document.document_number}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-3 text-sm">
            {document.work_title && (
              <div>
                <p className="text-slate-500 mb-0.5">Работа</p>
                <p className="font-medium text-slate-900">{document.work_title}</p>
              </div>
            )}
            
            {document.object_title && (
              <div>
                <p className="text-slate-500 mb-0.5">Объект</p>
                <p className="font-medium text-slate-900">{document.object_title}</p>
              </div>
            )}
            
            <div>
              <p className="text-slate-500 mb-0.5">Создан</p>
              <p className="font-medium text-slate-900">
                {document.createdAt ? format(new Date(document.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru }) : 'Не указано'}
              </p>
            </div>
            
            <div>
              <p className="text-slate-500 mb-0.5">Автор</p>
              <p className="font-medium text-slate-900">{document.created_by_name || 'Не указан'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-slate-50" 
              onClick={handleDownloadPDF}
            >
              <Icon name="Printer" size={18} className="mr-3 text-slate-600" />
              <span className="text-sm">Печать</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-slate-50"
              onClick={() => setIsEditing(true)}
            >
              <Icon name="Edit" size={18} className="mr-3 text-slate-600" />
              <span className="text-sm">Редактировать</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-slate-50"
              onClick={handleDownloadPDF}
            >
              <Icon name="Download" size={18} className="mr-3 text-slate-600" />
              <span className="text-sm">Скачать</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-slate-50"
            >
              <Icon name="Mail" size={18} className="mr-3 text-slate-600" />
              <span className="text-sm">Отправить клиенту</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-slate-50"
            >
              <Icon name="History" size={18} className="mr-3 text-slate-600" />
              <span className="text-sm">История изменений</span>
            </Button>

            <Separator className="my-2" />

            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 hover:bg-red-50 text-red-600 hover:text-red-700"
              onClick={handleDelete}
            >
              <Icon name="Trash2" size={18} className="mr-3" />
              <span className="text-sm">Удалить</span>
            </Button>
          </CardContent>
        </Card>

        {document?.status === 'draft' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Send" size={18} />
                Отправить на подпись
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 mb-3">
                Документ готов к подписанию. Отправьте его на согласование.
              </p>
              <Button size="sm" className="w-full" onClick={() => {}}>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить на подписание
              </Button>
            </CardContent>
          </Card>
        )}

        {canSign && mySignature && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="FileSignature" size={18} />
                Требуется подпись
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 mb-3">
                Необходимо подписать документ. Выберите способ подписи.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleRequestSignature}>
                  <Icon name="FileSignature" size={16} className="mr-1" />
                  Подписать
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReject(mySignature.id)}>
                  <Icon name="XCircle" size={16} className="mr-1" />
                  Отклонить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {document?.signatures && document.signatures.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="FileSignature" size={18} />
                Подписи ({document.signatures.filter(s => s.status === 'signed').length}/{document.signatures.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.signatures.map((sig) => (
                <div key={sig.id} className="flex items-start justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {sig.signer_name || 'Не указан'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sig.organization_name || sig.signer_email}
                    </p>
                    {sig.signed_at && (
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(sig.signed_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {sig.status === 'signed' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        Подписан
                      </Badge>
                    )}
                    {sig.status === 'pending' && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                        <Icon name="Clock" size={12} className="mr-1" />
                        Ожидает
                      </Badge>
                    )}
                    {sig.status === 'rejected' && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                        <Icon name="XCircle" size={12} className="mr-1" />
                        Отклонён
                      </Badge>
                    )}
                    {sig.signature_type && (
                      <span className="text-xs text-slate-400">
                        {sig.signature_type === 'sms' ? 'СМС' : 'ЭЦП'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <SignatureMethodDialog
        open={showSignatureMethod}
        onClose={() => setShowSignatureMethod(false)}
        onSelectMethod={handleSelectMethod}
        documentTitle={document?.title}
      />

      <SmsSignatureDialog
        open={showSmsDialog}
        onClose={() => setShowSmsDialog(false)}
        onSign={handleSmsSign}
        phoneNumber={user?.phone}
      />

      <EcpSignatureDialog
        open={showEcpDialog}
        onClose={() => setShowEcpDialog(false)}
        onSign={handleEcpSign}
      />
    </div>
  );
}