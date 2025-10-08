import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EstimateTabProps {
  handleCreateEstimate: () => void;
}

const mockEstimate = [
  { name: 'Материалы', quantity: '100 кг', price: '50 000 ₽', total: '50 000 ₽' },
  { name: 'Работа', quantity: '20 часов', price: '2 000 ₽/час', total: '40 000 ₽' },
  { name: 'Доставка', quantity: '1', price: '10 000 ₽', total: '10 000 ₽' },
];

export default function EstimateTab({ handleCreateEstimate }: EstimateTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Смета</h3>
          <Button size="sm" onClick={handleCreateEstimate}>
            <Icon name="Plus" size={16} className="mr-1" />
            Создать смету
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Наименование</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Количество</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Цена</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-700">Итого</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockEstimate.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm">{item.name}</td>
                      <td className="p-3 text-sm text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-sm text-slate-600">{item.price}</td>
                      <td className="p-3 text-sm font-semibold text-right">{item.total}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Icon name="MoreVertical" size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="p-3 text-sm font-semibold">Итого:</td>
                    <td className="p-3 text-base font-bold text-right">100 000 ₽</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calculator" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Бюджет</p>
                  <p className="text-lg font-bold">100 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingDown" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Потрачено</p>
                  <p className="text-lg font-bold">45 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Остаток</p>
                  <p className="text-lg font-bold">55 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}