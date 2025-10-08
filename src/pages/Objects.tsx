import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface ObjectItem {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  address: string;
  worksCount: number;
  lastUpdate: string;
  status: 'active' | 'pending' | 'completed';
  unreadCount: number;
}

const mockObjects: ObjectItem[] = [
  { id: '1', name: 'Объект №1 - ул. Баумана', projectId: '1', projectName: 'Капремонт Казани 2025', address: 'ул. Баумана, 12', worksCount: 15, lastUpdate: '2 часа назад', status: 'active', unreadCount: 3 },
  { id: '2', name: 'Объект №2 - Кремлевская', projectId: '1', projectName: 'Капремонт Казани 2025', address: 'ул. Кремлевская, 45', worksCount: 8, lastUpdate: '5 часов назад', status: 'active', unreadCount: 0 },
  { id: '3', name: 'Двор №5', projectId: '2', projectName: 'Благоустройство дворов', address: 'пр. Победы, 78', worksCount: 12, lastUpdate: '1 день назад', status: 'pending', unreadCount: 5 },
];

const statusConfig = {
  active: { label: 'В работе', color: 'bg-green-100 text-green-700', icon: '🟢' },
  pending: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  completed: { label: 'Завершено', color: 'bg-slate-100 text-slate-700', icon: '✅' },
};

export default function Objects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredObjects = mockObjects.filter((obj) => {
    const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || obj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleObjectClick = (obj: ObjectItem) => {
    navigate(`/projects/${obj.projectId}/objects/${obj.id}`);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Мои объекты</h1>
        
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по названию, адресу, проекту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Все ({mockObjects.length})
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            В работе ({mockObjects.filter(o => o.status === 'active').length})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            Ожидание ({mockObjects.filter(o => o.status === 'pending').length})
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            Завершено ({mockObjects.filter(o => o.status === 'completed').length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjects.map((obj, index) => {
            const statusInfo = statusConfig[obj.status];
            return (
              <Card
                key={obj.id}
                className="cursor-pointer hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleObjectClick(obj)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base md:text-lg font-semibold line-clamp-2">
                      {obj.name}
                    </CardTitle>
                    {obj.unreadCount > 0 && (
                      <span className="flex-shrink-0 flex items-center justify-center min-w-[24px] h-6 px-2 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {obj.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{obj.projectName}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Icon name="MapPin" size={16} />
                    <span className="line-clamp-1">{obj.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Icon name="Wrench" size={16} />
                      <span>{obj.worksCount} работ</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Icon name="Clock" size={16} />
                      <span>{obj.lastUpdate}</span>
                    </div>
                  </div>

                  <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', statusInfo.color)}>
                    <span>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredObjects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Icon name="Building2" size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Объекты не найдены</h3>
            <p className="text-slate-600">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}
