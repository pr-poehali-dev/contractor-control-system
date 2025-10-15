import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import InspectionHeader from '@/components/inspection/InspectionHeader';
import DefectsSection, { Defect } from '@/components/inspection/DefectsSection';
import ControlPointsSection, { ControlPoint } from '@/components/inspection/ControlPointsSection';

const InspectionDetail = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { userData, token, user, loadUserData } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefect, setNewDefect] = useState<Defect>({
    id: '',
    description: '',
    location: '',
    severity: '',
    responsible: '',
    deadline: ''
  });
  const [newDefectPhotos, setNewDefectPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [checkedPoints, setCheckedPoints] = useState<Set<string>>(new Set());
  const defectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userData?.inspections) {
      const found = userData.inspections.find((i: any) => i.id === Number(inspectionId));
      if (found) {
        setInspection(found);
        
        try {
          const parsedDefects = found.defects ? JSON.parse(found.defects) : [];
          setDefects(Array.isArray(parsedDefects) ? parsedDefects : []);
        } catch (e) {
          setDefects([]);
        }
        
        loadControlPointsForWork(found.work_id);
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
      console.error('Failed to load control points:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);

    const placeholderUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: `Файл ${file.name} не является изображением`,
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: `Файл ${file.name} слишком большой (максимум 10 МБ)`,
          variant: 'destructive',
        });
        continue;
      }

      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const fileName = encodeURIComponent(file.name);
      
      const placeholderUrl = `https://placehold.co/800x600/${randomColor}/ffffff?text=${fileName}`;
      placeholderUrls.push(placeholderUrl);
    }

    setNewDefectPhotos([...newDefectPhotos, ...placeholderUrls]);
    setUploadingPhotos(false);

    toast({
      title: 'Фото добавлены',
      description: `Добавлено ${placeholderUrls.length} фото`,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setNewDefectPhotos(newDefectPhotos.filter(url => url !== photoUrl));
  };

  const handleDefectChange = (field: keyof Defect, value: string) => {
    setNewDefect(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDefect = () => {
    if (!newDefect.description.trim()) {
      toast({ title: 'Заполните описание замечания', variant: 'destructive' });
      return;
    }

    const defect: Defect = {
      ...newDefect,
      id: Date.now().toString(),
      photo_urls: newDefectPhotos.length > 0 ? newDefectPhotos : undefined
    };

    setDefects([...defects, defect]);
    setNewDefect({
      id: '',
      description: '',
      location: '',
      severity: '',
      responsible: '',
      deadline: ''
    });
    setNewDefectPhotos([]);
    
    toast({ title: 'Замечание добавлено' });
  };

  const handleRemoveDefect = (id: string) => {
    setDefects(defects.filter(d => d.id !== id));
  };

  const handleCompleteInspection = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      await api.updateItem(token, 'inspection', inspection.id, {
        status: 'completed',
        defects: JSON.stringify(defects),
        completed_at: new Date().toISOString()
      });
      
      await loadUserData();
      
      toast({ title: 'Проверка завершена' });
      navigate('/inspections');
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось завершить проверку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      await api.updateItem(token, 'inspection', inspection.id, {
        defects: JSON.stringify(defects)
      });
      
      await loadUserData();
      
      toast({ title: 'Изменения сохранены' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось сохранить',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleControlPointClick = (cp: ControlPoint) => {
    const cpId = String(cp.id);
    const newChecked = new Set(checkedPoints);
    
    if (newChecked.has(cpId)) {
      newChecked.delete(cpId);
    } else {
      newChecked.add(cpId);
      setNewDefect(prev => ({ ...prev, description: cp.description }));
      
      setTimeout(() => {
        defectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    setCheckedPoints(newChecked);
  };

  if (!inspection) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <Icon name="ChevronLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <p className="text-slate-500 text-center mt-8">Проверка не найдена</p>
        </div>
      </div>
    );
  }

  const work = userData?.works?.find((w: any) => w.id === inspection.work_id);
  const object = userData?.objects?.find((o: any) => o.id === work?.object_id);
  
  const isClient = user?.role === 'client';
  const isDraft = inspection.status === 'draft';
  
  const workInspections = userData?.inspections?.filter((i: any) => i.work_id === inspection.work_id) || [];
  const inspectionIndex = workInspections.findIndex((i: any) => i.id === inspection.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/inspections')}
            className="shrink-0"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg truncate">
              Проверка №{inspectionIndex}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        <InspectionHeader
          inspectionNumber={inspection.inspection_number}
          status={inspection.status}
          type={inspection.type}
          workTitle={work?.title}
          objectTitle={object?.title}
          scheduledDate={inspection.scheduled_date}
        />

        <ControlPointsSection
          controlPoints={controlPoints}
          checkedPoints={checkedPoints}
          onControlPointClick={handleControlPointClick}
        />

        <div ref={defectsRef}>
          <DefectsSection
            defects={defects}
            newDefect={newDefect}
            newDefectPhotos={newDefectPhotos}
            uploadingPhotos={uploadingPhotos}
            isDraft={isDraft}
            isClient={isClient}
            fileInputRef={fileInputRef}
            onDefectChange={handleDefectChange}
            onFileSelect={handleFileSelect}
            onRemovePhoto={handleRemovePhoto}
            onAddDefect={handleAddDefect}
            onRemoveDefect={handleRemoveDefect}
          />
        </div>

        {isDraft && isClient && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-20">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex-1"
                disabled={loading}
              >
                Сохранить
              </Button>
              <Button
                onClick={handleCompleteInspection}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading}
              >
                {loading ? 'Завершение...' : 'Завершить проверку'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;