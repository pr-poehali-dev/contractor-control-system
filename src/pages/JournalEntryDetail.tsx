import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import Icon from '@/components/ui/icon';

const JournalEntryDetail = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const entry = {
    id: entryId,
    date: '05.10.2025',
    workName: 'Замена кровли',
    object: 'ул. Ленина, д. 10',
    project: 'Капремонт Казани 2025',
    description: 'Выполнены работы по монтажу кровельного покрытия на площади 150 м². Использована металлочерепица Монтеррей толщиной 0,5 мм. Установлены снегозадержатели и водосточная система. Все работы выполнены в соответствии с проектной документацией и требованиями ГОСТ 30547-97.',
    materials: [
      { name: 'Металлочерепица Монтеррей', quantity: '160 м²', unit: 'м²' },
      { name: 'Саморезы кровельные 4,8х35', quantity: '2500 шт', unit: 'шт' },
      { name: 'Гидроизоляция Изоспан D', quantity: '170 м²', unit: 'м²' },
      { name: 'Снегозадержатели трубчатые', quantity: '12 шт', unit: 'шт' },
      { name: 'Водосточная система ПВХ', quantity: '25 м.п.', unit: 'м.п.' },
    ],
    workers: 5,
    workersNames: ['Иванов С.С.', 'Петров А.А.', 'Сидоров И.В.', 'Козлов Д.П.', 'Смирнов В.Н.'],
    weather: 'Ясно, +18°C, ветер 3 м/с',
    startTime: '08:00',
    endTime: '17:00',
    author: 'Иванов Сергей Сергеевич',
    photos: 8,
  };

  const mockPhotos = Array.from({ length: entry.photos }, (_, i) => ({
    id: i + 1,
    url: `/placeholder-${i + 1}.jpg`,
    description: `Фото ${i + 1}`,
  }));

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        Назад к журналу
      </Button>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Запись в журнале работ</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Icon name="Edit" size={18} className="mr-2" />
              Редактировать
            </Button>
            <Button variant="outline">
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-2">
            <Icon name="Calendar" size={18} />
            {entry.date}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="FolderKanban" size={18} />
            {entry.project}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="MapPin" size={18} />
            {entry.object}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Вид работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">{entry.workName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Время работы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-900">{entry.startTime} - {entry.endTime}</p>
            <p className="text-sm text-slate-500">9 часов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Погодные условия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900">{entry.weather}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Описание выполненных работ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{entry.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Использованные материалы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entry.materials.map((material, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{material.name}</p>
                      <p className="text-sm text-slate-600">Единица: {material.unit}</p>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {material.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Фотофиксация ({entry.photos})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {mockPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center hover-scale cursor-pointer group relative overflow-hidden"
                    onClick={() => setSelectedPhoto(photo.id)}
                  >
                    <Icon name="Image" className="text-slate-400 group-hover:text-slate-600" size={32} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Состав бригады</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#2563EB] rounded-full flex items-center justify-center">
                    <Icon name="Users" className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{entry.workers}</p>
                    <p className="text-sm text-slate-600">рабочих</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {entry.workersNames.map((worker, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <Icon name="User" size={14} className="text-slate-400" />
                      {worker}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Информация о записи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon name="User" className="text-slate-500" size={20} />
                <div>
                  <p className="text-xs text-slate-600">Внесено</p>
                  <p className="font-medium text-sm">{entry.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Calendar" className="text-slate-500" size={20} />
                <div>
                  <p className="text-xs text-slate-600">Дата записи</p>
                  <p className="font-medium text-sm">{entry.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Clock" className="text-slate-500" size={20} />
                <div>
                  <p className="text-xs text-slate-600">Последнее изменение</p>
                  <p className="font-medium text-sm">{entry.date} 17:35</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                <Icon name="Image" className="text-slate-400" size={64} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Фото {selectedPhoto} из {entry.photos}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={selectedPhoto === 1}
                    onClick={() => setSelectedPhoto(selectedPhoto - 1)}
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={selectedPhoto === entry.photos}
                    onClick={() => setSelectedPhoto(selectedPhoto + 1)}
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntryDetail;
