import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import DefectReportHeader from '@/components/defect-report/DefectReportHeader';
import DefectReportInfo from '@/components/defect-report/DefectReportInfo';
import DefectItem from '@/components/defect-report/DefectItem';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

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
  
  const [report, setReport] = useState<any>(null);
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId, token]);

  const loadReport = async () => {
    if (!token || !reportId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(
        ENDPOINTS.DEFECTS.REPORTS + '?report_id=' + reportId
      );
      
      if (response.success && response.data) {
        setReport(response.data);
        setRemediations(response.data.remediations || []);
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

  const handleSubmitRemediation = async (
    defectId: string, 
    remediationId: number, 
    description: string, 
    photos: string[]
  ) => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await apiClient.put(
        ENDPOINTS.DEFECTS.REMEDIATION,
        {
          remediation_id: remediationId,
          status: 'completed',
          remediation_description: description,
          remediation_photos: photos
        }
      );
      
      if (response.success) {
        toast({ 
          title: 'Замечание устранено', 
          description: 'Информация отправлена на проверку' 
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

  const handleVerifyRemediation = async (
    remediationId: number, 
    approved: boolean, 
    notes: string
  ) => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await apiClient.put(
        ENDPOINTS.DEFECTS.REMEDIATION,
        {
          remediation_id: remediationId,
          status: approved ? 'verified' : 'rejected',
          verified_by: user?.id,
          verification_notes: notes
        }
      );
      
      if (response.success) {
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
      <DefectReportHeader reportNumber={report.report_number} />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DefectReportInfo report={report} progress={progress} />

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

              return (
                <DefectItem
                  key={defect.id}
                  defect={defect}
                  index={index}
                  remediation={remediation}
                  isContractor={isContractor}
                  isClient={isClient}
                  userId={user?.id}
                  onSubmitRemediation={handleSubmitRemediation}
                  onVerifyRemediation={handleVerifyRemediation}
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DefectReportDetail;