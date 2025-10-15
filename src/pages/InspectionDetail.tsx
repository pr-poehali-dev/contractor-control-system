import { useState, useEffect } from 'react';
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
  
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefectDescription, setNewDefectDescription] = useState('');
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
        
        const work = userData.works?.find((w: any) => w.id === found.work_id);
        if (work?.template_id) {
          loadControlPoints(work.template_id);
        }
      }
    }
  }, [userData, inspectionId]);

  const loadControlPoints = async (templateId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/c2c2804b-86fe-407a-ad48-4ea1f8e6fdcb`);
      const data = await response.json();
      
      const template = data.find((t: any) => t.id === templateId);
      if (template?.control_points) {
        setControlPoints(Array.isArray(template.control_points) ? template.control_points : []);
      }
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

  const handleAddDefect = () => {
    if (!newDefectDescription.trim()) {
      toast({ title: 'Заполните описание замечания', variant: 'destructive' });
      return;
    }

    const defect: Defect = {
      id: Date.now().toString(),
      description: newDefectDescription
    };

    setDefects([...defects, defect]);
    setNewDefectDescription('');
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
                  placeholder="Описание"
                  rows={2}
                  className="mb-3 text-sm"
                />
                <Button onClick={handleAddDefect} size="sm" className="w-full">
                  Добавить
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
                    <p className="text-slate-700 pr-8">{defect.description}</p>
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
