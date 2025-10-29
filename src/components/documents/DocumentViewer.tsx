import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDocumentDetail,
  selectCurrentDocument,
  selectDocumentsLoading,
} from '@/store/slices/documentsSlice';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentEditor from './DocumentEditor';
import SignatureMethodDialog from './SignatureMethodDialog';
import SmsSignatureDialog from './SmsSignatureDialog';
import EcpSignatureDialog from './EcpSignatureDialog';
import DocumentContent from './DocumentContent';
import DocumentInfo from './DocumentInfo';
import DocumentActions from './DocumentActions';
import DocumentSignatures from './DocumentSignatures';
import { useDocumentHandlers } from './useDocumentHandlers';
import { extractVariables, replaceVariables, handleDownloadPDF } from './useDocumentUtils';

interface DocumentViewerProps {
  documentId: number;
}

export default function DocumentViewer({ documentId }: DocumentViewerProps) {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const document = useAppSelector(selectCurrentDocument);
  const loading = useAppSelector(selectDocumentsLoading);
  const user = useAppSelector((state) => state.user.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSignatureMethod, setShowSignatureMethod] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showEcpDialog, setShowEcpDialog] = useState(false);

  const {
    handleSelectMethod,
    handleSmsSign,
    handleEcpSign,
    handleReject,
    handleDelete,
    handleSaveData,
    handleSendToSignature,
  } = useDocumentHandlers(documentId, user, document);

  useEffect(() => {
    dispatch(fetchDocumentDetail(documentId));
  }, [dispatch, documentId]);

  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit) {
      setIsEditing(true);
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const onRequestSignature = () => {
    setShowSignatureMethod(true);
  };

  const onSelectMethod = async (method: 'sms' | 'ecp') => {
    setShowSignatureMethod(false);
    await handleSelectMethod(method);
    
    if (method === 'sms') {
      setShowSmsDialog(true);
    } else {
      setShowEcpDialog(true);
    }
  };

  const onDownloadPDF = () => {
    handleDownloadPDF(document, replaceVariables);
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

  if (isEditing) {
    const variableKeys = extractVariables(document.htmlContent || '');
    
    return (
      <DocumentEditor
        htmlContent={document.htmlContent || ''}
        variables={variableKeys}
        contentData={document.contentData || {}}
        onSave={(data) => {
          handleSaveData(data);
        }}
        onDownload={onDownloadPDF}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const documentHtml = replaceVariables(document.htmlContent || '', document.contentData || {});

  return (
    <div className="grid lg:grid-cols-[1fr,380px] gap-6">
      <DocumentContent documentHtml={documentHtml} />

      <div className="space-y-4">
        <DocumentInfo document={document} />

        <DocumentActions
          onPrint={onDownloadPDF}
          onEdit={() => setIsEditing(true)}
          onDownload={onDownloadPDF}
          onDelete={handleDelete}
        />

        <DocumentSignatures
          document={document}
          userId={user?.id}
          onRequestSignature={onRequestSignature}
          onReject={handleReject}
          onSendToSignature={handleSendToSignature}
        />
      </div>

      <SignatureMethodDialog
        open={showSignatureMethod}
        onClose={() => setShowSignatureMethod(false)}
        onSelectMethod={onSelectMethod}
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