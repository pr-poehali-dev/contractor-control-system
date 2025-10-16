import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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

const DefectReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const [report, setReport] = useState<any>(null);
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);
  const [remediationText, setRemediationText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string[]>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId, token]);

  const loadReport = async () => {
    if (!token || !reportId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/d230b3d9-8dbd-410c-b023-9c021131a15b?report_id=${reportId}`,
        {
          headers: {
            'X-User-Id': user?.id?.toString() || '',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setRemediations(data.remediations || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить акт',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (defectId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(prev => ({ ...prev, [defectId]: true }));

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

      setUploadedPhotos(prev => ({
        ...prev,
        [defectId]: [...(prev[defectId] || []), ...uploadedUrls]
      }));

      toast({ title: 'Фото загружены' });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [defectId]: false }));
    }
  };

  const handleRemovePhoto = (defectId: string, photoUrl: string) => {
    setUploadedPhotos(prev => ({
      ...prev,
      [defectId]: (prev[defectId] || []).filter(url => url !== photoUrl)
    }));
  };

  const handleSubmitRemediation = async (defectId: string, remediationId: number) => {
    if (!token || !remediationText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо описать выполненные работы',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/ef8edfd4-ef48-48a9-95fb-78f5a4982949',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user?.id?.toString() || '',
          },
          body: JSON.stringify({
            remediation_id: remediationId,
            status: 'completed',
            remediation_description: remediationText,
            remediation_photos: uploadedPhotos[defectId] || []
          })
        }
      );
      
      if (response.ok) {
        toast({ title: 'Замечание устранено', description: 'Информация отправлена на проверку' });
        setEditingDefectId(null);
        setRemediationText('');
        setUploadedPhotos(prev => {
          const newState = { ...prev };
          delete newState[defectId];
          return newState;
        });
        await loadReport();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить информацию',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyRemediation = async (remediationId: number, approved: boolean, notes: string) => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/ef8edfd4-ef48-48a9-95fb-78f5a4982949',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user?.id?.toString() || '',
          },
          body: JSON.stringify({
            remediation_id: remediationId,
            status: approved ? 'verified' : 'rejected',
            verified_by: user?.id,
            verification_notes: notes
          })
        }
      );
      
      if (response.ok) {
        toast({ 
          title: approved ? 'Устранение подтверждено' : 'Устранение отклонено',
          description: approved ? 'Замечание успешно закрыто' : 'Замечание возвращено на доработку'
        });
        await loadReport();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
      pending: { label: 'Ожидает устранения', variant: 'secondary', color: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'В работе', variant: 'default', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Устранено', variant: 'outline', color: 'bg-amber-100 text-amber-700' },
      verified: { label: 'Подтверждено', variant: 'outline', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Отклонено', variant: 'destructive', color: 'bg-red-100 text-red-700' }
    };
    
    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity?: string) => {
    if (severity === 'critical') return <Badge className="bg-red-100 text-red-700">Критическое</Badge>;
    if (severity === 'high') return <Badge className="bg-orange-100 text-orange-700">Высокая</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Средняя</Badge>;
  };

  const calculateProgress = () => {
    if (remediations.length === 0) return 0;
    const completedCount = remediations.filter(r => r.status === 'verified').length;
    return Math.round((completedCount / remediations.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка акта...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <p className="text-slate-500 text-center mt-8">Акт не найден</p>
      </div>
    );
  }

  const defects: Defect[] = report.report_data?.defects || [];
  const isContractor = user?.role === 'contractor';
  const isClient = user?.role === 'client';
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl">Акт {report.report_number}</h1>
              <p className="text-sm text-slate-500">Акт об обнаружении дефектов</p>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Скачать PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-lg p-2.5">
                    <Icon name="FileText" size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Номер акта</p>
                    <p className="font-semibold">{report.report_number}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-lg p-2.5">
                    <Icon name="Building2" size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Объект</p>
                    <p className="font-semibold">{report.object_title}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-lg p-2.5">
                    <Icon name="Wrench" size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Вид работ</p>
                    <p className="font-semibold">{report.work_title}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 rounded-lg p-2.5">
                    <Icon name="Calendar" size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Дата формирования</p>
                    <p className="font-semibold">
                      {new Date(report.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-lg p-2.5">
                    <Icon name="AlertTriangle" size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Всего замечаний</p>
                    <p className="font-semibold">
                      {report.total_defects} шт.
                      {report.critical_defects > 0 && (
                        <span className="text-red-600 text-sm ml-2">
                          ({report.critical_defects} критических)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 rounded-lg p-2.5">
                    <Icon name="TrendingUp" size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">Прогресс устранения</p>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm font-semibold mt-1">{progress}% завершено</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={20} />
              Выявленные замечания
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {defects.map((defect, index) => {
              const remediation = remediations.find(r => r.defect_id === defect.id);
              const isEditing = editingDefectId === defect.id;
              const defectPhotos = uploadedPhotos[defect.id] || [];

              return (
                <div key={defect.id} className="border rounded-lg p-5 space-y-4 bg-white hover:shadow-md transition-shadow">
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
                              onClick={() => setEditingDefectId(defect.id)}
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
                                  ref={el => fileInputRefs.current[defect.id] = el}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(defect.id, e)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRefs.current[defect.id]?.click()}
                                  disabled={uploadingPhotos[defect.id]}
                                >
                                  {uploadingPhotos[defect.id] ? (
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

                                {defectPhotos.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mt-3">
                                    {defectPhotos.map((photoUrl, idx) => (
                                      <div key={idx} className="relative group">
                                        <img
                                          src={photoUrl}
                                          alt={`Фото ${idx + 1}`}
                                          className="w-full h-24 object-cover rounded border"
                                        />
                                        <button
                                          onClick={() => handleRemovePhoto(defect.id, photoUrl)}
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
                                  onClick={() => handleSubmitRemediation(defect.id, remediation.id)}
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
                                  onClick={() => {
                                    setEditingDefectId(null);
                                    setRemediationText('');
                                    setUploadedPhotos(prev => {
                                      const newState = { ...prev };
                                      delete newState[defect.id];
                                      return newState;
                                    });
                                  }}
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

                          {remediation.status === 'completed' && (isClient || user?.role === 'admin') && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyRemediation(remediation.id, true, '')}
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
                                  if (notes) handleVerifyRemediation(remediation.id, false, notes);
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
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DefectReportDetail;
