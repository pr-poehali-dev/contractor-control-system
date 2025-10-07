import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  date: string;
  workName: string;
  description: string;
  materials: string;
  workers: number;
  photos: number;
  author: string;
}

const mockEntries: LogEntry[] = [
  {
    id: '1',
    date: '05.10.2025',
    workName: 'Замена кровли',
    description: 'Выполнены работы по монтажу кровельного покрытия на площади 150 м². Использовано металлочерепица Монтеррей.',
    materials: 'Металлочерепица Монтеррей - 160 м², Саморезы кровельные - 2500 шт., Гидроизоляция - 170 м²',
    workers: 5,
    photos: 8,
    author: 'Иванов С.С.'
  },
  {
    id: '2',
    date: '04.10.2025',
    workName: 'Замена кровли',
    description: 'Демонтаж старого кровельного покрытия, подготовка основания. Установка обрешётки.',
    materials: 'Брус 50x50 - 120 м.п., Гвозди - 5 кг',
    workers: 4,
    photos: 12,
    author: 'Иванов С.С.'
  },
  {
    id: '3',
    date: '03.10.2025',
    workName: 'Ремонт фасада',
    description: 'Оштукатуривание фасада первого этажа. Нанесение грунтовки.',
    materials: 'Штукатурка цементная - 250 кг, Грунтовка глубокого проникновения - 40 л',
    workers: 3,
    photos: 6,
    author: 'Петров А.А.'
  },
];

const WorkLog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddEntry = () => {
    toast({
      title: 'Запись добавлена',
      description: 'Новая запись в журнале работ успешно создана',
    });
    setOpen(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Журнал работ</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить запись
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новая запись в журнале</DialogTitle>
                <DialogDescription>
                  Заполните информацию о выполненных работах
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="work-name">Вид работ</Label>
                  <Input id="work-name" placeholder="Например: Замена кровли" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание выполненных работ</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Подробно опишите что было сделано..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materials">Использованные материалы</Label>
                  <Textarea 
                    id="materials" 
                    placeholder="Перечислите материалы с указанием количества..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workers">Количество рабочих</Label>
                    <Input id="workers" type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата выполнения</Label>
                    <Input id="date" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Фотофиксация</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
                    <Icon name="Upload" size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Нажмите или перетащите фото</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG до 10MB</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddEntry} className="flex-1">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить запись
                  </Button>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-slate-600">Ведение журнала строительных работ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего записей</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{mockEntries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">За эту неделю</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Фотографий</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {mockEntries.reduce((sum, e) => sum + e.photos, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Активных работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">2</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mockEntries.map((entry, index) => (
          <Card 
            key={entry.id} 
            className="animate-fade-in hover-scale cursor-pointer" 
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/journal-entry/${entry.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{entry.workName}</CardTitle>
                    <Badge variant="outline">{entry.date}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{entry.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-1">Материалы:</p>
                  <p className="text-sm text-slate-600">{entry.materials}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    {entry.workers} рабочих
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon name="Image" size={16} />
                    {entry.photos} фото
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    {entry.author}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Eye" size={16} className="mr-2" />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkLog;