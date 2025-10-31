import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { createOrganization, updateOrganization, fetchOrganizationDetail } from '@/store/slices/organizationsSlice';
import { updateProfile } from '@/store/slices/userSlice';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { AppDispatch } from '@/store/store';
import { ROUTES } from '@/constants/routes';

const ClientOnboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuthRedux();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    kpp: '',
    ogrn: '',
    legal_address: '',
    actual_address: '',
    phone: '',
    email: '',
    bik: '',
    bank_name: '',
    payment_account: '',
    correspondent_account: '',
    director_name: '',
    director_position: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (user?.onboarding_completed && user?.role === 'client' && !user?.organization_id) {
      navigate(ROUTES.OBJECTS);
      return;
    }

    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }

    if (user?.organization_id) {
      setIsEditMode(true);
      setIsLoading(true);
      dispatch(fetchOrganizationDetail(user.organization_id))
        .unwrap()
        .then((org) => {
          setFormData({
            name: org.name || '',
            inn: org.inn || '',
            kpp: org.kpp || '',
            ogrn: org.ogrn || '',
            legal_address: org.legal_address || '',
            actual_address: org.actual_address || '',
            phone: org.phone || '',
            email: org.email || '',
            bik: org.bik || '',
            bank_name: org.bank_name || '',
            payment_account: org.payment_account || '',
            correspondent_account: org.correspondent_account || '',
            director_name: org.director_name || '',
            director_position: org.director_position || ''
          });
        })
        .catch((error) => {
          console.error('Failed to load organization:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user?.organization_id, user?.onboarding_completed, user?.role, dispatch, navigate]);

  const handleSkip = async () => {
    try {
      await dispatch(updateProfile({ onboarding_completed: true })).unwrap();
      navigate(ROUTES.OBJECTS);
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      navigate(ROUTES.OBJECTS);
    }
  };

  const handleSubmit = async () => {
    if (!userData.name) {
      alert('Пожалуйста, заполните ваше имя');
      return;
    }

    if (!formData.name || !formData.inn) {
      alert('Пожалуйста, заполните обязательные поля: Название организации и ИНН');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateProfile({ ...userData, onboarding_completed: true })).unwrap();

      if (isEditMode && user?.organization_id) {
        await dispatch(updateOrganization({ id: user.organization_id, ...formData })).unwrap();
        alert('Данные успешно обновлены');
        navigate(ROUTES.PROFILE);
      } else {
        await dispatch(createOrganization({ ...formData, type: 'client' })).unwrap();
        navigate(ROUTES.OBJECTS);
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('Ошибка при сохранении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep0Valid = userData.name;
  const isStep1Valid = formData.name && formData.inn;
  const isStep2Valid = formData.legal_address;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="Building2" size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Реквизиты организации' : 'Добро пожаловать!'}
          </CardTitle>
          <p className="text-slate-600 mt-2">
            {isEditMode ? 'Редактируйте информацию о вашей организации' : 'Заполните информацию о вашей организации для работы в системе'}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`h-2 w-20 rounded-full ${currentStep >= 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            <div className={`h-2 w-20 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            <div className={`h-2 w-20 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            <div className={`h-2 w-20 rounded-full ${currentStep >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Информация о вас
              </h3>
              
              <div>
                <Label htmlFor="user_name">Ваше имя *</Label>
                <Input
                  id="user_name"
                  value={userData.name}
                  onChange={(e) => handleUserChange('name', e.target.value)}
                  placeholder="Иван Иванов"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="user_email">Email</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleUserChange('email', e.target.value)}
                  placeholder="ivan@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="user_phone">Телефон</Label>
                <Input
                  id="user_phone"
                  value={userData.phone}
                  onChange={(e) => handleUserChange('phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Основная информация
              </h3>
              
              <div>
                <Label htmlFor="name">Название организации *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ООО «Название»"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={formData.inn}
                    onChange={(e) => handleChange('inn', e.target.value)}
                    placeholder="1234567890"
                    maxLength={12}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="kpp">КПП</Label>
                  <Input
                    id="kpp"
                    value={formData.kpp}
                    onChange={(e) => handleChange('kpp', e.target.value)}
                    placeholder="123456789"
                    maxLength={9}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ogrn">ОГРН</Label>
                <Input
                  id="ogrn"
                  value={formData.ogrn}
                  onChange={(e) => handleChange('ogrn', e.target.value)}
                  placeholder="1234567890123"
                  maxLength={15}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="info@company.ru"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Адреса и руководство
              </h3>

              <div>
                <Label htmlFor="legal_address">Юридический адрес *</Label>
                <Input
                  id="legal_address"
                  value={formData.legal_address}
                  onChange={(e) => handleChange('legal_address', e.target.value)}
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="actual_address">Фактический адрес</Label>
                <Input
                  id="actual_address"
                  value={formData.actual_address}
                  onChange={(e) => handleChange('actual_address', e.target.value)}
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="director_name">ФИО руководителя</Label>
                  <Input
                    id="director_name"
                    value={formData.director_name}
                    onChange={(e) => handleChange('director_name', e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="director_position">Должность</Label>
                  <Input
                    id="director_position"
                    value={formData.director_position}
                    onChange={(e) => handleChange('director_position', e.target.value)}
                    placeholder="Генеральный директор"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Банковские реквизиты
              </h3>

              <div>
                <Label htmlFor="bank_name">Название банка</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  placeholder="ПАО Сбербанк"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bik">БИК</Label>
                <Input
                  id="bik"
                  value={formData.bik}
                  onChange={(e) => handleChange('bik', e.target.value)}
                  placeholder="044525225"
                  maxLength={9}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="payment_account">Расчетный счет</Label>
                <Input
                  id="payment_account"
                  value={formData.payment_account}
                  onChange={(e) => handleChange('payment_account', e.target.value)}
                  placeholder="40702810400000000000"
                  maxLength={20}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="correspondent_account">Корреспондентский счет</Label>
                <Input
                  id="correspondent_account"
                  value={formData.correspondent_account}
                  onChange={(e) => handleChange('correspondent_account', e.target.value)}
                  placeholder="30101810400000000225"
                  maxLength={20}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            {currentStep === 0 ? (
              isEditMode ? (
                <Button
                  variant="ghost"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="text-slate-600"
                >
                  Отмена
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-slate-600"
                >
                  Пропустить
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Назад
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 0 && !isStep0Valid) ||
                  (currentStep === 1 && !isStep1Valid)
                }
              >
                Далее
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep0Valid || !isStep1Valid}
              >
                {isSubmitting ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Завершить')}
                <Icon name="Check" size={16} className="ml-1" />
              </Button>
            )}
          </div>

          {(currentStep === 0 || currentStep === 1) && (
            <p className="text-xs text-slate-500 text-center">
              * Обязательные поля
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOnboarding;