import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Defect {
  id: string;
  description: string;
  normative_ref?: string;
  photo_url?: string;
}

const InspectionDetail = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { userData, token, user, loadUserData } = useAuth();
  const { toast } = useToast();
  
  const [inspection, setInspection] = useState<any>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefect, setNewDefect] = useState({ description: '', normative_ref: '', photo_url: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
      }
    }
  }, [userData, inspectionId]);

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
  const isPending = inspection.status === 'pending';
  const isCompleted = inspection.status === 'completed';

  const handleAddDefect = () => {
    if (!newDefect.description.trim()) {
      toast({ title: 'Заполните описание замечания', variant: 'destructive' });
      return;
    }

    const defect: Defect = {
      id: Date.now().toString(),
      description: newDefect.description,
      normative_ref: newDefect.normative_ref || undefined,
      photo_url: newDefect.photo_url || undefined
    };

    setDefects([...defects, defect]);
    setNewDefect({ description: '', normative_ref: '', photo_url: '' });
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Запланирована', color: 'bg-blue-100 text-blue-700' };
      case 'in_progress':
        return { label: 'В процессе', color: 'bg-yellow-100 text-yellow-700' };
      case 'completed':
        return { label: 'Завершена', color: 'bg-green-100 text-green-700' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700' };
    }
  };

  const statusInfo = getStatusInfo(inspection.status);

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
              {inspection.title || `Проверка #${inspection.inspection_number}`}
            </h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
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
              rows={4}
              disabled={isCompleted || !isClient}
              className="mb-3"
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="AlertCircle" size={20} />
              Замечания ({defects.length})
            </h3>

            {defects.length > 0 && (
              <div className="space-y-3 mb-6">
                {defects.map((defect, index) => (
                  <div key={defect.id} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">#{index + 1}</p>
                        <p className="text-slate-700 mt-1">{defect.description}</p>
                        {defect.normative_ref && (
                          <p className="text-sm text-slate-600 mt-2">
                            <Icon name="FileText" size={14} className="inline mr-1" />
                            Норматив: {defect.normative_ref}
                          </p>
                        )}
                        {defect.photo_url && (
                          <div className="mt-2">
                            <img 
                              src={defect.photo_url} 
                              alt="Замечание" 
                              className="max-w-xs rounded border"
                            />
                          </div>
                        )}
                      </div>
                      {!isCompleted && isClient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDefect(defect.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isCompleted && isClient && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-slate-900">Добавить замечание</h4>
                
                <div>
                  <Label>Описание замечания *</Label>
                  <Textarea
                    value={newDefect.description}
                    onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                    placeholder="Опишите выявленное нарушение..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Ссылка на норматив</Label>
                  <Input
                    value={newDefect.normative_ref}
                    onChange={(e) => setNewDefect({ ...newDefect, normative_ref: e.target.value })}
                    placeholder="СНиП, ГОСТ и т.д."
                  />
                </div>

                <div>
                  <Label>URL фото</Label>
                  <Input
                    value={newDefect.photo_url}
                    onChange={(e) => setNewDefect({ ...newDefect, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <Button onClick={handleAddDefect} variant="outline" className="w-full">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить замечание
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isClient && !isCompleted && (
          <div className="flex gap-3">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Сохранить черновик
            </Button>
            <Button
              onClick={handleCompleteInspection}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Сохранение...' : 'Завершить проверку'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetail;
