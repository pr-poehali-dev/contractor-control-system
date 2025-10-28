import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDocumentDetail,
  createSignatureRequest,
  signDocument,
  updateDocument,
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
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  documentId: number;
}

export default function DocumentViewer({ documentId }: DocumentViewerProps) {
  const dispatch = useAppDispatch();
  const document = useAppSelector(selectCurrentDocument);
  const loading = useAppSelector(selectDocumentsLoading);
  const user = useAppSelector((state) => state.user.user);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchDocumentDetail(documentId));
  }, [dispatch, documentId]);

  useEffect(() => {
    if (document && document.status === 'draft') {
      setIsEditing(true);
    }
  }, [document]);

  const handleSign = async (signatureId: number) => {
    await dispatch(signDocument({
      signature_id: signatureId,
      action: 'sign',
      signature_data: `Signed by user ${user?.id} at ${new Date().toISOString()}`,
    }));
    
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

  const extractVariables = (html: string): string[] => {
    const matches = html.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/[\[\]]/g, '').trim()))];
  };

  const handleDownloadPDF = () => {
    let content = document?.htmlContent || '';
    const data = document?.contentData || {};

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      content = content.replace(regex, String(value || ''));
    });

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
              <p className="text-slate-500">{document.document_number}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {document.status === 'draft' && (
                <Badge className="bg-slate-100 text-slate-700">Черновик</Badge>
              )}
              {document.status === 'pending_signature' && (
                <Badge className="bg-amber-100 text-amber-700">На подписи</Badge>
              )}
              {document.status === 'signed' && (
                <Badge className="bg-green-100 text-green-700">Подписан</Badge>
              )}
              {document.status === 'rejected' && (
                <Badge className="bg-red-100 text-red-700">Отклонён</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Работа</p>
              <p className="font-medium">{document.work_title}</p>
            </div>
            
            <div>
              <p className="text-slate-500 mb-1">Объект</p>
              <p className="font-medium">{document.object_title}</p>
            </div>
            
            <div>
              <p className="text-slate-500 mb-1">Создан</p>
              <p className="font-medium">
                {document.createdAt ? format(new Date(document.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru }) : 'Не указано'}
              </p>
            </div>
            
            <div>
              <p className="text-slate-500 mb-1">Автор</p>
              <p className="font-medium">{document.created_by_name || 'Не указан'}</p>
            </div>

            {document.contractor_organization && (
              <div className="col-span-2">
                <p className="text-slate-500 mb-1">Организация подрядчика</p>
                <p className="font-medium">{document.contractor_organization}</p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {isEditing && document.status === 'draft' ? (
        <DocumentEditor
          htmlContent={document.htmlContent || ''}
          variables={extractVariables(document.htmlContent || '')}
          contentData={document.contentData || {}}
          onSave={handleSaveData}
          onDownload={handleDownloadPDF}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Содержание документа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-lg border prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: document.htmlContent || 'Нет содержимого' }} />
            </div>
          </CardContent>
        </Card>
      )}

      {canSign && mySignature && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="FileSignature" size={20} />
              Требуется ваша подпись
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              Вам необходимо подписать этот документ. Пожалуйста, ознакомьтесь с содержанием и примите решение.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => handleSign(mySignature.id)}>
                <Icon name="CheckCircle" size={18} className="mr-2" />
                Подписать
              </Button>
              <Button variant="destructive" onClick={() => handleReject(mySignature.id)}>
                <Icon name="XCircle" size={18} className="mr-2" />
                Отклонить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileSignature" size={20} />
            Подписи ({document.signatures?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {document.signatures && document.signatures.length > 0 ? (
            <div className="space-y-3">
              {document.signatures.map((signature) => (
                <div
                  key={signature.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    signature.status === 'signed' && 'bg-green-50 border-green-200',
                    signature.status === 'rejected' && 'bg-red-50 border-red-200',
                    signature.status === 'pending' && 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{signature.signer_name}</p>
                      <p className="text-sm text-slate-600">{signature.signer_email}</p>
                      {signature.organization_name && (
                        <p className="text-sm text-slate-500">{signature.organization_name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {signature.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-700">Ожидает</Badge>
                      )}
                      {signature.status === 'signed' && (
                        <Badge className="bg-green-100 text-green-700">Подписан</Badge>
                      )}
                      {signature.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-700">Отклонён</Badge>
                      )}
                    </div>
                  </div>

                  {signature.signed_at && (
                    <p className="text-sm text-slate-600">
                      Подписано {format(new Date(signature.signed_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  )}

                  {signature.rejected_at && signature.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm">
                      <p className="font-medium text-red-700">Причина отклонения:</p>
                      <p className="text-red-600">{signature.rejection_reason}</p>
                      <p className="text-xs text-red-500 mt-1">
                        {format(new Date(signature.rejected_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">Подписи отсутствуют</p>
          )}
        </CardContent>
      </Card>

      {document.versions && document.versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="History" size={20} />
              История версий ({document.versions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {document.versions.map((version) => (
                <div key={version.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Версия {version.version}</p>
                      <p className="text-sm text-slate-600">{version.changed_by_name}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {format(new Date(version.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  {version.change_description && (
                    <p className="text-sm text-slate-600 mt-2">{version.change_description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}