import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Defect {
  id: string;
  description: string;
  location?: string;
  severity?: string;
  responsible?: string;
  deadline?: string;
  photo_urls?: string[];
}

interface Remediation {
  id: number;
  defect_id: string;
  contractor_id: number;
  status: string;
  remediation_description?: string;
  remediation_photos?: string[];
  completed_at?: string;
  verified_at?: string;
  verified_by?: number;
  verification_notes?: string;
}

interface DefectItemProps {
  defect: Defect;
  index: number;
  remediation?: Remediation;
  isContractor: boolean;
  isClient: boolean;
  userId?: number;
  onSubmitRemediation: (defectId: string, remediationId: number, description: string, photos: string[]) => Promise<void>;
  onVerifyRemediation: (remediationId: number, approved: boolean, notes: string) => Promise<void>;
}

const DefectItem = ({
  defect,
  index,
  remediation,
  isContractor,
  isClient,
  userId,
  onSubmitRemediation,
  onVerifyRemediation
}: DefectItemProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [remediationText, setRemediationText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://upload.poehali.dev/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      setUploadedPhotos(prev => [...prev, ...uploadedUrls]);
      toast({ title: 'Фото загружены' });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  const handleSubmit = async () => {
    if (!remediationText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо описать выполненные работы',
        variant: 'destructive'
      });
      return;
    }
    
    if (!remediation) return;

    setSubmitting(true);
    try {
      await onSubmitRemediation(defect.id, remediation.id, remediationText, uploadedPhotos);
      setIsEditing(false);
      setRemediationText('');
      setUploadedPhotos([]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRemediationText('');
    setUploadedPhotos([]);
  };

  const getSeverityBadge = (severity?: string) => {
    if (severity === 'critical') return <Badge className="bg-red-100 text-red-700">Критическое</Badge>;
    if (severity === 'high') return <Badge className="bg-orange-100 text-orange-700">Высокая</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Средняя</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Ожидает устранения', color: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Устранено', color: 'bg-amber-100 text-amber-700' },
      verified: { label: 'Подтверждено', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-700' }
    };
    
    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-white hover:shadow-md transition-shadow">
      {/* Defect Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-lg">{defect.description}</h3>
            <div className="flex gap-2">
              {getSeverityBadge(defect.severity)}
              {remediation && getStatusBadge(remediation.status)}
            </div>
          </div>

          {defect.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Icon name="MapPin" size={14} />
              <span>{defect.location}</span>
            </div>
          )}

          {defect.responsible && (
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Icon name="User" size={14} />
              <span>Ответственный: {defect.responsible}</span>
            </div>
          )}

          {defect.deadline && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Icon name="Clock" size={14} />
              <span>Срок устранения: {new Date(defect.deadline).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Remediation Section */}
      {remediation && (
        <div className="space-y-3">
          {remediation.status === 'pending' && isContractor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Отметить как устраненное
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label>Описание выполненных работ *</Label>
                  <Textarea
                    placeholder="Опишите как было устранено замечание..."
                    value={remediationText}
                    onChange={(e) => setRemediationText(e.target.value)}
                    rows={4}
                  />

                  <div>
                    <Label className="mb-2 block">Фотографии после устранения</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhotos}
                    >
                      {uploadingPhotos ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Icon name="ImagePlus" size={16} className="mr-2" />
                          Добавить фото
                        </>
                      )}
                    </Button>

                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {uploadedPhotos.map((photoUrl, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photoUrl}
                              alt={`Фото ${idx + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              onClick={() => handleRemovePhoto(photoUrl)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !remediationText.trim()}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={16} className="mr-2" />
                          Отправить на проверку
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(remediation.status === 'completed' || remediation.status === 'verified' || remediation.status === 'rejected') && (
            <div className={`border rounded-lg p-4 ${
              remediation.status === 'verified' ? 'bg-green-50 border-green-200' :
              remediation.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name={remediation.status === 'verified' ? 'CheckCircle' : remediation.status === 'rejected' ? 'XCircle' : 'Clock'} size={16} />
                <span className="font-medium">
                  {remediation.status === 'verified' ? 'Устранение подтверждено' :
                   remediation.status === 'rejected' ? 'Устранение отклонено' :
                   'Ожидает проверки'}
                </span>
              </div>

              {remediation.remediation_description && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-700 mb-1">Описание работ:</p>
                  <p className="text-sm text-slate-600">{remediation.remediation_description}</p>
                </div>
              )}

              {remediation.remediation_photos && remediation.remediation_photos.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Фото после устранения:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {remediation.remediation_photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {remediation.completed_at && (
                <p className="text-xs text-slate-500">
                  Устранено: {new Date(remediation.completed_at).toLocaleString('ru-RU')}
                </p>
              )}

              {remediation.verification_notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-slate-700 mb-1">Комментарий проверяющего:</p>
                  <p className="text-sm text-slate-600">{remediation.verification_notes}</p>
                </div>
              )}

              {remediation.status === 'completed' && (isClient || userId) && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => onVerifyRemediation(remediation.id, true, '')}
                    disabled={submitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Icon name="Check" size={14} className="mr-2" />
                    Подтвердить
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const notes = prompt('Укажите причину отклонения:');
                      if (notes) onVerifyRemediation(remediation.id, false, notes);
                    }}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <Icon name="X" size={14} className="mr-2" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DefectItem;
