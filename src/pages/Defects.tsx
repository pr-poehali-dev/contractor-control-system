import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Defect {
  id: string;
  title: string;
  description: string;
  standard: string;
  workName: string;
  object: string;
  project: string;
  status: 'open' | 'inProgress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  createdDate: string;
  resolvedDate?: string;
  photos: string[];
  author: string;
  contractor: string;
}

const mockDefects: Defect[] = [
  {
    id: '1',
    title: 'Несоответствие качества кровельного покрытия',
    description: 'Обнаружены механические повреждения металлочерепицы на участке 15 м². Необходима замена повреждённых листов.',
    standard: 'ГОСТ 30547-97, п. 5.2.1',
    workName: 'Замена кровли',
    object: 'ул. Ленина, д. 10',
    project: 'Капремонт Казани 2025',
    status: 'open',
    priority: 'high',
    createdDate: '05.10.2025',
    photos: ['photo1.jpg', 'photo2.jpg'],
    author: 'Инспектор Петров',
    contractor: 'ООО "СтройМастер"'
  },
  {
    id: '2',
    title: 'Нарушение герметизации примыканий',
    description: 'В местах примыкания кровли к дымоходу отсутствует герметизация. Требуется установка планок примыкания и герметизация швов.',
    standard: 'ГОСТ 30547-97, п. 5.3.4',
    workName: 'Замена кровли',
    object: 'ул. Ленина, д. 10',
    project: 'Капремонт Казани 2025',
    status: 'inProgress',
    priority: 'high',
    createdDate: '05.10.2025',
    photos: ['photo3.jpg'],
    author: 'Инспектор Петров',
    contractor: 'ООО "СтройМастер"'
  },
  {
    id: '3',
    title: 'Неровность штукатурного слоя',
    description: 'На участке фасада обнаружены неровности штукатурного слоя более 5 мм. Требуется выравнивание.',
    standard: 'СНиП 3.04.01-87, п. 3.12',
    workName: 'Ремонт фасада',
    object: 'ул. Пушкина, д. 5',
    project: 'Капремонт Казани 2025',
    status: 'resolved',
    priority: 'medium',
    createdDate: '03.10.2025',
    resolvedDate: '05.10.2025',
    photos: ['photo4.jpg', 'photo5.jpg'],
    author: 'Инспектор Петров',
    contractor: 'ООО "Фасад-Мастер"'
  },
];

const getPriorityBadge = (priority: Defect['priority']) => {
  const variants = {
    high: { label: 'Высокий', variant: 'destructive' as const },
    medium: { label: 'Средний', variant: 'default' as const },
    low: { label: 'Низкий', variant: 'secondary' as const }
  };
  return variants[priority];
};

const getStatusBadge = (status: Defect['status']) => {
  const variants = {
    open: { label: 'Открыто', variant: 'destructive' as const },
    inProgress: { label: 'В работе', variant: 'default' as const },
    resolved: { label: 'Устранено', variant: 'outline' as const }
  };
  return variants[status];
};

const Defects = () => {
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Замечания</h1>
        <p className="text-slate-600">Управление замечаниями и несоответствиями</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего замечаний</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{mockDefects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Открыто</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {mockDefects.filter(d => d.status === 'open').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">
              {mockDefects.filter(d => d.status === 'inProgress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Устранено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {mockDefects.filter(d => d.status === 'resolved').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все замечания</TabsTrigger>
          <TabsTrigger value="open">Открыто</TabsTrigger>
          <TabsTrigger value="inProgress">В работе</TabsTrigger>
          <TabsTrigger value="resolved">Устранено</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {mockDefects.map((defect, index) => (
            <Card 
              key={defect.id}
              className="cursor-pointer hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedDefect(defect)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={getStatusBadge(defect.status).variant}>
                        {getStatusBadge(defect.status).label}
                      </Badge>
                      <Badge variant={getPriorityBadge(defect.priority).variant}>
                        {getPriorityBadge(defect.priority).label}
                      </Badge>
                      <Badge variant="outline">{defect.standard}</Badge>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{defect.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{defect.description}</p>
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <Icon name="Wrench" size={14} />
                        {defect.workName}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} />
                        {defect.object}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="Building" size={14} />
                        Подрядчик: {defect.contractor}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Icon name="ChevronRight" className="text-slate-400" size={24} />
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Icon name="Camera" size={14} />
                      {defect.photos.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="open" className="mt-6 space-y-4">
          {mockDefects.filter(d => d.status === 'open').map((defect) => (
            <Card key={defect.id} className="cursor-pointer hover-scale border-red-300" onClick={() => setSelectedDefect(defect)}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{defect.title}</h3>
                <p className="text-sm text-slate-600">{defect.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-6 space-y-4">
          {mockDefects.filter(d => d.status === 'inProgress').map((defect) => (
            <Card key={defect.id} className="cursor-pointer hover-scale" onClick={() => setSelectedDefect(defect)}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{defect.title}</h3>
                <p className="text-sm text-slate-600">{defect.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6 space-y-4">
          {mockDefects.filter(d => d.status === 'resolved').map((defect) => (
            <Card key={defect.id} className="cursor-pointer hover-scale border-green-300" onClick={() => setSelectedDefect(defect)}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{defect.title}</h3>
                <p className="text-sm text-slate-600">{defect.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedDefect} onOpenChange={() => setSelectedDefect(null)}>
        <DialogContent className="max-w-3xl">
          {selectedDefect && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedDefect.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusBadge(selectedDefect.status).variant}>
                      {getStatusBadge(selectedDefect.status).label}
                    </Badge>
                    <Badge variant={getPriorityBadge(selectedDefect.priority).variant}>
                      {getPriorityBadge(selectedDefect.priority).label}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Описание:</h3>
                  <p className="text-slate-600">{selectedDefect.description}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon name="BookOpen" className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Нормативный документ:</h3>
                      <p className="text-sm text-blue-700">{selectedDefect.standard}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Информация:</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="FolderKanban" size={16} />
                        {selectedDefect.project}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="MapPin" size={16} />
                        {selectedDefect.object}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="Wrench" size={16} />
                        {selectedDefect.workName}
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="Building" size={16} />
                        {selectedDefect.contractor}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Даты:</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="Calendar" size={16} />
                        Создано: {selectedDefect.createdDate}
                      </p>
                      {selectedDefect.resolvedDate && (
                        <p className="flex items-center gap-2 text-slate-600">
                          <Icon name="CheckCircle2" size={16} />
                          Устранено: {selectedDefect.resolvedDate}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-slate-600">
                        <Icon name="User" size={16} />
                        {selectedDefect.author}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Фотофиксация ({selectedDefect.photos.length}):</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedDefect.photos.map((photo, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center hover-scale cursor-pointer">
                        <Icon name="Image" className="text-slate-400" size={32} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedDefect.status !== 'resolved' && (
                    <>
                      <Button className="flex-1">
                        <Icon name="CheckCircle2" size={18} className="mr-2" />
                        Отметить устранённым
                      </Button>
                      <Button variant="outline">
                        <Icon name="MessageSquare" size={18} className="mr-2" />
                        Связаться
                      </Button>
                    </>
                  )}
                  <Button variant="outline">
                    <Icon name="Download" size={18} className="mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Defects;
