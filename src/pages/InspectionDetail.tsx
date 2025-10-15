import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Defect {
  id: string;
  description: string;
  photo_urls?: string[];
}

interface ControlPoint {
  id: string | number;
  description: string;
  standard: string;
  standard_clause: string;
  is_critical: boolean;
}

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">draft</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Завершена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {inspection.inspection_number}
            </h1>
            {getStatusBadge(inspection.status)}
          </div>
          
          {inspection.type && (
            <p className="text-slate-600">
              {inspection.type === 'scheduled' ? '📅 Плановая проверка' : '⚡ Внеплановая проверка'}
            </p>
          )}
          
          {work && (
            <p className="text-slate-600 mt-1">
              <Icon name="Wrench" size={16} className="inline mr-1" />
              {work.title}
              {object && ` • ${object.title}`}
            </p>
          )}
          
          {inspection.scheduled_date && (
            <p className="text-slate-600 mt-1">
              <Icon name="Calendar" size={16} className="inline mr-1" />
              Запланирована на: {new Date(inspection.scheduled_date).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>

        {inspection.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-slate-700">{inspection.description}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Примечания</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Общие примечания по проверке..."
              rows={3}
              disabled={!isDraft || !isClient}
              className="text-sm"
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                Замечания ({defects.length})
              </h3>
              {isDraft && isClient && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setNewDefectDescription('')}
                  className="text-sm"
                >
                  Добавить замечание
                </Button>
              )}
            </div>

            {isDraft && isClient && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <Textarea
                  value={newDefectDescription}
                  onChange={(e) => setNewDefectDescription(e.target.value)}
                  placeholder="Описание замечания"
                  rows={3}
                  className="mb-3 text-sm"
                />
                
                <div className="mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhotos}
                    className="w-full mb-2"
                  >
                    <Icon name="Camera" size={16} className="mr-2" />
                    {uploadingPhotos ? 'Загрузка...' : 'Добавить фото'}
                  </Button>

                  {newDefectPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {newDefectPhotos.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Фото ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePhoto(url)}
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleAddDefect} size="sm" className="w-full">
                  Добавить замечание
                </Button>
              </div>
            )}

            {defects.length > 0 ? (
              <div className="space-y-3">
                {defects.map((defect, index) => (
                  <div key={defect.id} className="border rounded-lg p-4 bg-white relative">
                    {isDraft && isClient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDefect(defect.id)}
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                    <p className="font-medium text-sm text-slate-500 mb-1">#{index + 1}</p>
                    <p className="text-slate-700 pr-8 mb-2">{defect.description}</p>
                    
                    {defect.photo_urls && defect.photo_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {defect.photo_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Замечание ${index + 1} - фото ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Замечаний нет</p>
            )}
          </CardContent>
        </Card>

        {controlPoints.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Рекомендации для проверки</h3>
              <div className="space-y-3">
                {controlPoints.map((cp) => {
                  const cpId = String(cp.id);
                  const isChecked = checkedPoints.has(cpId);
                  
                  return (
                    <div 
                      key={cpId}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isChecked ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => toggleCheckpoint(cpId)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isChecked}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            Соответствие с регламентом {cp.standard}
                          </p>
                          <p className="text-sm text-slate-700">{cp.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isDraft && isClient && (
          <div className="flex gap-3 sticky bottom-4">
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
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Завершение...' : 'Завершить проверку'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;