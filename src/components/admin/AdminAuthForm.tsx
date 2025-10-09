import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminAuthFormProps {
  adminKey: string;
  onAdminKeyChange: (key: string) => void;
  onAuth: () => void;
}

export const AdminAuthForm = ({ adminKey, onAdminKeyChange, onAuth }: AdminAuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            Админ-панель
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Введите ключ администратора"
            value={adminKey}
            onChange={(e) => onAdminKeyChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAuth()}
          />
          <Button onClick={onAuth} className="w-full">
            Войти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
