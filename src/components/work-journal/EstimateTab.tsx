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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl font-bold">Смета</h3>
          <Button onClick={handleCreateEstimate}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать смету
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-5 text-lg font-semibold text-slate-700">Наименование</th>
                    <th className="text-left p-5 text-lg font-semibold text-slate-700">Количество</th>
                    <th className="text-left p-5 text-lg font-semibold text-slate-700">Цена</th>
                    <th className="text-right p-5 text-lg font-semibold text-slate-700">Итого</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockEstimate.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-5 text-lg">{item.name}</td>
                      <td className="p-5 text-lg text-slate-600">{item.quantity}</td>
                      <td className="p-5 text-lg text-slate-600">{item.price}</td>
                      <td className="p-5 text-lg font-semibold text-right">{item.total}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="p-5 text-lg font-semibold">Итого:</td>
                    <td className="p-5 text-xl font-bold text-right">100 000 ₽</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calculator" size={26} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Бюджет</p>
                  <p className="text-xl font-bold">100 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingDown" size={26} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Потрачено</p>
                  <p className="text-xl font-bold">45 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={26} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Остаток</p>
                  <p className="text-xl font-bold">55 000 ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}