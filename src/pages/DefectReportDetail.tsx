import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Defect {
  id: string;
  description: string;
  location?: string;
  severity?: string;
  photo_urls?: string[];
}

interface Remediation {
  id: number;
  defect_id: string;
  status: string;
  remediation_description?: string;
  remediation_photos?: string[];
  completed_at?: string;
  verified_at?: string;
  verified_by_name?: string;
  verification_notes?: string;
}

const DefectReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [report, setReport] = useState<any>(null);
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);
  const [remediationText, setRemediationText] = useState('');
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

  const handleSubmitRemediation = async (defectId: string, remediationId: number) => {
    if (!token || !remediationText.trim()) return;
    
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
            status: 'in_progress',
            remediation_description: remediationText
          })
        }
      );
      
      if (response.ok) {
        toast({ title: 'Информация об устранении отправлена' });
        setEditingDefectId(null);
        setRemediationText('');
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

  const handleMarkCompleted = async (remediationId: number) => {
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
            status: 'completed'
          })
        }
      );
      
      if (response.ok) {
        toast({ title: 'Замечание отмечено как устраненное' });
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
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ожидает устранения', variant: 'secondary' },
      in_progress: { label: 'В работе', variant: 'default' },
      completed: { label: 'Устранено', variant: 'outline' },
      rejected: { label: 'Отклонено', variant: 'destructive' }
    };
    
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityColor = (severity?: string) => {
    if (severity === 'Критический') return 'text-red-600 bg-red-50';
    if (severity === 'Существенный') return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">
              Акт {report.report_number}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 rounded-full p-3">
                <Icon name="FileText" size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Акт об обнаружении дефектов
                </h2>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Icon name="Hash" size={16} />
                    <span className="font-medium">№ {report.report_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={16} />
                    <span>{report.object_title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Wrench" size={16} />
                    <span>{report.work_title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>Сформирован: {new Date(report.created_at).toLocaleString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Icon name="AlertCircle" size={16} className="text-red-600" />
                    <span className="font-medium">Всего замечаний: {report.total_defects}</span>
                    {report.critical_defects > 0 && (
                      <span className="text-red-600">
                        (критических: {report.critical_defects})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Icon name="ListX" size={20} />
            Выявленные замечания
          </h3>
          
          {defects.map((defect, index) => {
            const remediation = remediations.find(r => r.defect_id === defect.id);
            const isEditing = editingDefectId === defect.id;
            
            return (
              <Card key={defect.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${getSeverityColor(defect.severity)}`}>
                        {index + 1}
                      </div>
                      <div>
                        {defect.severity && (
                          <Badge variant="outline" className="mb-2">
                            {defect.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {remediation && getStatusBadge(remediation.status)}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Описание замечания:</p>
                      <p className="text-slate-700">{defect.description}</p>
                    </div>

                    {defect.location && (
                      <div>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          <span className="font-medium">Местоположение:</span>
                          <span>{defect.location}</span>
                        </p>
                      </div>
                    )}

                    {defect.photo_urls && defect.photo_urls.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Фотографии:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {defect.photo_urls.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Defect ${i + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {remediation && remediation.remediation_description && (
                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Icon name="Wrench" size={16} />
                          Информация об устранении:
                        </p>
                        <p className="text-blue-800 text-sm">{remediation.remediation_description}</p>
                        {remediation.completed_at && (
                          <p className="text-xs text-blue-600 mt-2">
                            Устранено: {new Date(remediation.completed_at).toLocaleString('ru-RU')}
                          </p>
                        )}
                      </div>
                    )}

                    {remediation && remediation.status === 'completed' && remediation.verified_at && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="font-medium text-green-900 mb-1 flex items-center gap-2">
                          <Icon name="CheckCircle2" size={16} />
                          Принято заказчиком
                        </p>
                        <p className="text-sm text-green-700">
                          {new Date(remediation.verified_at).toLocaleString('ru-RU')}
                        </p>
                        {remediation.verification_notes && (
                          <p className="text-sm text-green-800 mt-2">{remediation.verification_notes}</p>
                        )}
                      </div>
                    )}

                    {isContractor && remediation && remediation.status === 'pending' && (
                      <div className="border-t pt-4 mt-4">
                        {!isEditing ? (
                          <Button 
                            onClick={() => {
                              setEditingDefectId(defect.id);
                              setRemediationText(remediation.remediation_description || '');
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Icon name="Edit" size={16} className="mr-2" />
                            Направить информацию об устранении
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <Label>Описание выполненных работ</Label>
                              <Textarea
                                value={remediationText}
                                onChange={(e) => setRemediationText(e.target.value)}
                                placeholder="Опишите, какие работы были выполнены для устранения замечания..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSubmitRemediation(defect.id, remediation.id)}
                                disabled={submitting || !remediationText.trim()}
                                size="sm"
                              >
                                {submitting ? 'Отправка...' : 'Отправить'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingDefectId(null);
                                  setRemediationText('');
                                }}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isContractor && remediation && remediation.status === 'in_progress' && (
                      <div className="border-t pt-4 mt-4">
                        <Button 
                          onClick={() => handleMarkCompleted(remediation.id)}
                          disabled={submitting}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="Check" size={16} className="mr-2" />
                          Отметить как устраненное
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DefectReportDetail;
