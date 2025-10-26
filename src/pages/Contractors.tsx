import { useState, useEffect } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ContractorDetailsModal from '@/components/contractors/ContractorDetailsModal';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

const Contractors = () => {
  const { user, userData } = useAuthRedux();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', phone: '', inn: '' });
  const [isChecking, setIsChecking] = useState(false);
  const [existingContractor, setExistingContractor] = useState<any>(null);
  const [contractors, setContractors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadContractors();
  }, [user]);

  const loadContractors = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.get(ENDPOINTS.CONTRACTORS.LIST + '?client_id=' + user.id);
      setContractors(response.data?.contractors || []);
    } catch (error) {
      console.error('Failed to load contractors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCheckINN = async () => {
    if (!inviteData.inn || !inviteData.name) {
      toast({
        title: 'Ошибка',
        description: 'Заполните ИНН и название организации',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setExistingContractor(null);

    try {
      const response = await apiClient.post(ENDPOINTS.CONTRACTORS.INVITE, {
        inn: inviteData.inn,
        name: inviteData.name,
        email: inviteData.email,
        phone: inviteData.phone,
        client_id: user?.id,
      });

      const data = response.data;

      if (data.exists && data.already_linked) {
        toast({
          title: 'Подрядчик уже добавлен',
          description: 'Этот подрядчик уже есть в вашем списке',
        });
        setInviteOpen(false);
      } else if (data.exists && !data.already_linked) {
        setExistingContractor(data.contractor);
      } else if (data.created) {
        toast({
          title: 'Подрядчик приглашён!',
          description: `Создан аккаунт для ${data.contractor.name}. Email: ${data.contractor.email}, Пароль: ${data.credentials.password}`,
          duration: 10000,
        });
        setInviteOpen(false);
        setInviteData({ name: '', email: '', phone: '', inn: '' });
        setExistingContractor(null);
        loadContractors();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить подрядчика',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLinkExisting = async () => {
    if (!existingContractor) return;

    try {
      const response = await apiClient.post(ENDPOINTS.CONTRACTORS.LINK, {
        client_id: user?.id,
        contractor_id: existingContractor.id,
      });

      if (response.success) {
        toast({
          title: 'Подрядчик добавлен',
          description: `${existingContractor.name} добавлен в ваш список`,
        });
        setInviteOpen(false);
        setExistingContractor(null);
        setInviteData({ name: '', email: '', phone: '', inn: '' });
        loadContractors();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить подрядчика',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Подрядчики</h1>
            <p className="text-slate-600">Организации, выполняющие работы по вашим проектам</p>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="UserPlus" size={18} />
                <span className="hidden sm:inline">Пригласить подрядчика</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Пригласить подрядчика</DialogTitle>
              <DialogDescription>
                Введите ИНН и данные организации. Система проверит, есть ли уже такой подрядчик.
              </DialogDescription>
            </DialogHeader>
            
            {existingContractor ? (
              <div className="space-y-4 py-4">
                <Alert>
                  <Icon name="Info" size={16} className="mt-0.5" />
                  <AlertDescription>
                    Подрядчик с ИНН {inviteData.inn} уже зарегистрирован в системе
                  </AlertDescription>
                </Alert>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-slate-600">Организация</Label>
                        <p className="font-medium">{existingContractor.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">ИНН</Label>
                        <p className="font-medium">{existingContractor.inn}</p>
                      </div>
                      {existingContractor.email && (
                        <div>
                          <Label className="text-slate-600">Email</Label>
                          <p className="font-medium">{existingContractor.email}</p>
                        </div>
                      )}
                      {existingContractor.phone && (
                        <div>
                          <Label className="text-slate-600">Телефон</Label>
                          <p className="font-medium">{existingContractor.phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setExistingContractor(null)} className="flex-1">
                    Назад
                  </Button>
                  <Button onClick={handleLinkExisting} className="flex-1">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить в мой список
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН организации *</Label>
                  <Input
                    id="inn"
                    value={inviteData.inn}
                    onChange={(e) => setInviteData({ ...inviteData, inn: e.target.value })}
                    placeholder="1234567890"
                    maxLength={12}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Название организации *</Label>
                  <Input
                    id="name"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    placeholder="ООО 'СтройПроект'"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="contractor@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={inviteData.phone}
                    onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                    placeholder="+7 (900) 123-45-67"
                  />
                </div>
                
                <Button onClick={handleCheckINN} className="w-full" disabled={isChecking}>
                  {isChecking ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Icon name="Search" size={18} className="mr-2" />
                      Проверить и пригласить
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : contractors.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Users" size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет подрядчиков</h3>
          <p className="text-slate-500">Пригласите подрядчиков для работы над проектами</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((contractor, index) => (
            <Card 
              key={contractor.id}
              className="hover:shadow-lg transition-shadow animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => {
                setSelectedContractor(contractor);
                setDetailsOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {getInitials(contractor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2 truncate">
                      {contractor.name}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="FileText" size={16} />
                        <span>ИНН: {contractor.inn}</span>
                      </div>

                      {contractor.user?.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon name="Mail" size={16} />
                          <span className="truncate">{contractor.user.email}</span>
                        </div>
                      )}

                      {contractor.user?.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Icon name="Phone" size={16} />
                          <span>{contractor.user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <Icon name="Building2" size={12} className="mr-1" />
                          Подрядчик
                        </Badge>
                        {contractor.added_at && (
                          <span className="text-xs text-slate-500">
                            Добавлен {new Date(contractor.added_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContractorDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        contractor={selectedContractor}
      />
    </div>
  );
};

export default Contractors;