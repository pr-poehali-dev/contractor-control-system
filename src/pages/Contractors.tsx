import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Contractor {
  id: string;
  name: string;
  inn: string;
  contact: string;
  phone: string;
  email: string;
  activeWorks: number;
  completedWorks: number;
  defectsCount: number;
  rating: number;
}

const mockContractors: Contractor[] = [
  {
    id: '1',
    name: 'ООО "СтройМастер"',
    inn: '1234567890',
    contact: 'Иванов Сергей Сергеевич',
    phone: '+7 (900) 123-45-67',
    email: 'info@stroymast.ru',
    activeWorks: 2,
    completedWorks: 15,
    defectsCount: 2,
    rating: 4.5
  },
  {
    id: '2',
    name: 'ИП Петров А.А.',
    inn: '9876543210',
    contact: 'Петров Андрей Андреевич',
    phone: '+7 (900) 765-43-21',
    email: 'petrov@mail.ru',
    activeWorks: 1,
    completedWorks: 8,
    defectsCount: 0,
    rating: 5.0
  },
  {
    id: '3',
    name: 'ООО "Фасад-Мастер"',
    inn: '5555666677',
    contact: 'Сидоров Игорь Викторович',
    phone: '+7 (900) 555-66-77',
    email: 'fasad@master.ru',
    activeWorks: 3,
    completedWorks: 22,
    defectsCount: 6,
    rating: 4.0
  },
  {
    id: '4',
    name: 'ООО "ТеплоДом"',
    inn: '1112223334',
    contact: 'Козлов Дмитрий Петрович',
    phone: '+7 (900) 111-22-33',
    email: 'info@teplodom.ru',
    activeWorks: 1,
    completedWorks: 10,
    defectsCount: 1,
    rating: 4.7
  },
];

const Contractors = () => {
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContractors = mockContractors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.inn.includes(searchQuery)
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Подрядчики</h1>
          <Button size="lg">
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить подрядчика
          </Button>
        </div>
        <p className="text-slate-600">Справочник подрядных организаций</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Поиск по названию или ИНН..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContractors.map((contractor, index) => (
          <Card 
            key={contractor.id}
            className="cursor-pointer hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedContractor(contractor)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{contractor.name}</CardTitle>
                  <p className="text-sm text-slate-600">ИНН: {contractor.inn}</p>
                  <p className="text-sm text-slate-600">{contractor.contact}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Star" className="text-yellow-500 fill-yellow-500" size={18} />
                  <span className="font-semibold">{contractor.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#2563EB]">{contractor.activeWorks}</p>
                    <p className="text-xs text-slate-500">Активных</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{contractor.completedWorks}</p>
                    <p className="text-xs text-slate-500">Завершено</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{contractor.defectsCount}</p>
                    <p className="text-xs text-slate-500">Замечаний</p>
                  </div>
                </div>
                <Icon name="ChevronRight" className="text-slate-400" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedContractor} onOpenChange={() => setSelectedContractor(null)}>
        <DialogContent className="max-w-2xl">
          {selectedContractor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedContractor.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="font-semibold">{selectedContractor.rating}</span>
                    </div>
                    <Badge variant="outline">ИНН: {selectedContractor.inn}</Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Контактная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon name="User" className="text-slate-500" size={20} />
                      <div>
                        <p className="text-sm text-slate-600">Контактное лицо</p>
                        <p className="font-medium">{selectedContractor.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Phone" className="text-slate-500" size={20} />
                      <div>
                        <p className="text-sm text-slate-600">Телефон</p>
                        <p className="font-medium">{selectedContractor.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="Mail" className="text-slate-500" size={20} />
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-medium">{selectedContractor.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Статистика работ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-[#2563EB] mb-1">
                          {selectedContractor.activeWorks}
                        </p>
                        <p className="text-sm text-slate-600">Активных работ</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600 mb-1">
                          {selectedContractor.completedWorks}
                        </p>
                        <p className="text-sm text-slate-600">Завершено</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-3xl font-bold text-red-600 mb-1">
                          {selectedContractor.defectsCount}
                        </p>
                        <p className="text-sm text-slate-600">Замечаний</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Icon name="MessageSquare" size={18} className="mr-2" />
                    Написать сообщение
                  </Button>
                  <Button variant="outline">
                    <Icon name="Phone" size={18} className="mr-2" />
                    Позвонить
                  </Button>
                  <Button variant="outline">
                    <Icon name="FileText" size={18} className="mr-2" />
                    Договор
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

export default Contractors;
