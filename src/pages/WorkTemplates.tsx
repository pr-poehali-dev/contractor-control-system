import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface WorkTemplate {
  id: number;
  code: string;
  title: string;
  norm_hours: number;
  materials: string;
  category: string;
}

const WorkTemplates = () => {
  const [templates, setTemplates] = useState<WorkTemplate[]>([]);

  useEffect(() => {
    fetch('https://functions.poehali.dev/91aacaa0-6a60-4cea-92f7-7e8e076784aa')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Справочник типовых работ</h1>
        <p className="text-slate-600">ГОСТ и СНиП нормативы строительных работ</p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{template.code}</Badge>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
                <Icon name="BookOpen" size={24} className="text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Категория:</span>
                  <p className="font-medium">{template.category}</p>
                </div>
                <div>
                  <span className="text-slate-500">Норматив:</span>
                  <p className="font-medium">{template.norm_hours} ч/ед</p>
                </div>
                <div>
                  <span className="text-slate-500">Материалы:</span>
                  <p className="font-medium">{template.materials}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkTemplates;
