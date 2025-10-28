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
        
        if (found.status === 'completed' && parsedDefects.length > 0) {
          loadDefectReport(found.id);
        }
      }
    }
  }, [userData, inspectionId]);

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

  const loadDefectReport = async (inspectionId: number) => {
    if (!token) return;
    
    try {
      const response = await apiClient.get(ENDPOINTS.DOCUMENTS.BASE);
      
      if (response.success && response.data) {
        const documents = Array.isArray(response.data) ? response.data : [];
        const defectDoc = documents.find((doc: any) => 
          doc.document_type === 'defect_act' && 
          doc.content?.inspectionNumber?.includes(inspectionId.toString())
        );
        
        if (defectDoc) {
          setDefectReport({
            id: defectDoc.id,
            report_number: defectDoc.content?.reportNumber || defectDoc.title,
            total_defects: defectDoc.content?.totalDefects || 0,
            critical_defects: defectDoc.content?.criticalDefects || 0,
            created_at: defectDoc.created_at,
            status: defectDoc.status
          });
        }
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