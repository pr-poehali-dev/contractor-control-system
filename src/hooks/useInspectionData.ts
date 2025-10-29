import { useState, useEffect } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Defect } from '@/components/inspection/DefectsSection';
import { ControlPoint } from '@/components/inspection/ControlPointsSection';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export function useInspectionData(inspectionId: string | undefined) {
  const { userData, user, token } = useAuthRedux();
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [defectReport, setDefectReport] = useState<any>(null);

  useEffect(() => {
    if (userData?.inspections) {
      const found = userData.inspections.find((i: any) => i.id === Number(inspectionId));
      if (found) {
        setInspection(found);
        
        let parsedDefects: Defect[] = [];
        try {
          parsedDefects = found.defects ? JSON.parse(found.defects) : [];
          setDefects(Array.isArray(parsedDefects) ? parsedDefects : []);
        } catch (error) {
          console.error('Failed to parse defects JSON:', error instanceof Error ? error.message : String(error));
          setDefects([]);
        }
        
        loadControlPointsForWork(found.work_id);
      }
    }
  }, [userData, inspectionId]);

  // Отдельный эффект для загрузки документа акта
  useEffect(() => {
    if (inspection?.defect_report_document_id) {
      loadDefectReport(inspection);
    } else {
      setDefectReport(null);
    }
  }, [inspection?.defect_report_document_id, token]);

  const loadControlPointsForWork = async (workId: number) => {
    try {
      const work = userData?.works?.find((w: any) => w.id === workId);
      if (!work) {
        console.log('Work not found for id:', workId);
        return;
      }

      console.log('Loading control points for work:', work.title);
      
      const mockPoints: ControlPoint[] = [
        {
          id: 1,
          description: 'Проверка соответствия материалов проектной документации',
          standard: 'СНиП 3.03.01-87',
          standard_clause: 'п. 4.2',
          is_critical: true
        },
        {
          id: 2,
          description: 'Контроль качества сварных соединений',
          standard: 'СНиП 3.03.01-87',
          standard_clause: 'п. 5.1',
          is_critical: true
        },
        {
          id: 3,
          description: 'Проверка геометрических размеров конструкций',
          standard: 'ГОСТ 23118-2012',
          standard_clause: 'п. 6.3',
          is_critical: false
        },
        {
          id: 4,
          description: 'Контроль антикоррозионного покрытия',
          standard: 'СП 28.13330.2017',
          standard_clause: 'п. 8.4',
          is_critical: false
        }
      ];
      
      setControlPoints(mockPoints);
      console.log('Loaded control points:', mockPoints.length);
    } catch (error) {
      console.error('Failed to load control points:', error instanceof Error ? error.message : String(error));
      setControlPoints([]);
    }
  };

  const loadDefectReport = async (inspection: any) => {
    if (!token || !inspection?.defect_report_document_id) return;
    
    try {
      const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS.BASE}?id=${inspection.defect_report_document_id}`);
      
      if (response.success && response.data) {
        const doc = response.data;
        setDefectReport({
          id: doc.id,
          report_number: doc.content?.reportNumber || doc.title,
          total_defects: doc.content?.totalDefects || 0,
          critical_defects: doc.content?.criticalDefects || 0,
          created_at: doc.created_at,
          status: doc.status
        });
      }
    } catch (error) {
      console.error('Failed to load defect report:', error instanceof Error ? error.message : String(error));
      setDefectReport(null);
    }
  };

  return {
    inspection,
    defects,
    setDefects,
    controlPoints,
    defectReport,
    setDefectReport
  };
}