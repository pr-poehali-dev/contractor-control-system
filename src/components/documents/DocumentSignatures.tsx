import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Document, DocumentSignature } from '@/store/slices/documentsSlice';

interface DocumentSignaturesProps {
  document: Document;
  userId?: number;
  onRequestSignature: () => void;
  onReject: (signatureId: number) => void;
}

export default function DocumentSignatures({ 
  document, 
  userId,
  onRequestSignature, 
  onReject 
}: DocumentSignaturesProps) {
  const canSign = document.signatures?.some(
    sig => sig.signer_id === userId && sig.status === 'pending'
  );
  
  const mySignature = document.signatures?.find(sig => sig.signer_id === userId);

  return (
    <>
      {document.status === 'draft' && (
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
              <Button size="sm" className="flex-1" onClick={onRequestSignature}>
                <Icon name="FileSignature" size={16} className="mr-1" />
                Подписать
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => onReject(mySignature.id)}>
                <Icon name="XCircle" size={16} className="mr-1" />
                Отклонить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {document.signatures && document.signatures.length > 0 && (
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
    </>
  );
}
