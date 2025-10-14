import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AnalyticsTab = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Аналитика</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Icon name="BarChart3" size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Раздел в разработке</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
