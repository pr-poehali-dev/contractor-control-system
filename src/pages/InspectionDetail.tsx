import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import InspectionHeader from '@/components/inspection/InspectionHeader';
import InspectionNotes from '@/components/inspection/InspectionNotes';
import DefectsSection, { Defect } from '@/components/inspection/DefectsSection';
import ControlPointsSection, { ControlPoint } from '@/components/inspection/ControlPointsSection';
import InspectionActions from '@/components/inspection/InspectionActions';

const InspectionDetail = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { userData, token, user, loadUserData } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefectDescription, setNewDefectDescription] = useState('');
  const [newDefectPhotos, setNewDefectPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [checkedPoints, setCheckedPoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userData?.inspections) {
      const found = userData.inspections.find((i: any) => i.id === Number(inspectionId));
      if (found) {
        setInspection(found);
        setNotes(found.notes || '');
        
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
      if (!work) return;

      const response = await fetch('https://functions.poehali.dev/c2c2804b-86fe-407a-ad48-4ea1f8e6fdcb');
      const templates = await response.json();
      
      let foundPoints: ControlPoint[] = [];
      
      for (const template of templates) {
        if (work.title && template.title && work.title.toLowerCase().includes(template.title.toLowerCase().split(' ')[0])) {
          if (template.control_points && Array.isArray(template.control_points)) {
            foundPoints = template.control_points;
            break;
          }
        }
      }
      
      if (foundPoints.length === 0 && templates[0]?.control_points) {
        foundPoints = templates[0].control_points;
      }
      
      setControlPoints(foundPoints);
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

  const handleAddDefect = () => {
    if (!newDefectDescription.trim()) {
      toast({ title: 'Заполните описание замечания', variant: 'destructive' });
      return;
    }

    const defect: Defect = {
      id: Date.now().toString(),
      description: newDefectDescription,
      photo_urls: newDefectPhotos.length > 0 ? newDefectPhotos : undefined
    };

    setDefects([...defects, defect]);
    setNewDefectDescription('');
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
        notes: notes,
        defects: JSON.stringify(defects),
        completed_at: new Date().toISOString()
      });
      
      await loadUserData();
      
      toast({ title: 'Проверка завершена' });
      navigate(-1);
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
        notes: notes,
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

  const toggleCheckpoint = (cpId: string) => {
    const newChecked = new Set(checkedPoints);
    if (newChecked.has(cpId)) {
      newChecked.delete(cpId);
    } else {
      newChecked.add(cpId);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>

        <InspectionHeader
          inspectionNumber={inspection.inspection_number}
          status={inspection.status}
          type={inspection.type}
          workTitle={work?.title}
          objectTitle={object?.title}
          scheduledDate={inspection.scheduled_date}
        />

        {inspection.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-slate-700">{inspection.description}</p>
            </CardContent>
          </Card>
        )}

        <InspectionNotes
          notes={notes}
          onNotesChange={setNotes}
          disabled={!isDraft || !isClient}
        />

        <DefectsSection
          defects={defects}
          newDefectDescription={newDefectDescription}
          newDefectPhotos={newDefectPhotos}
          uploadingPhotos={uploadingPhotos}
          isDraft={isDraft}
          isClient={isClient}
          fileInputRef={fileInputRef}
          onDescriptionChange={setNewDefectDescription}
          onFileSelect={handleFileSelect}
          onRemovePhoto={handleRemovePhoto}
          onAddDefect={handleAddDefect}
          onRemoveDefect={handleRemoveDefect}
        />

        <ControlPointsSection
          controlPoints={controlPoints}
          checkedPoints={checkedPoints}
          onToggleCheckpoint={toggleCheckpoint}
        />

        {isDraft && isClient && (
          <InspectionActions
            loading={loading}
            onSaveDraft={handleSaveDraft}
            onComplete={handleCompleteInspection}
          />
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;
