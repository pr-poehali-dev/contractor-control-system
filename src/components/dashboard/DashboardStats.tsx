import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
      {stats.map((stat, index) => (
        <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={stat.icon as any} size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <p className="text-[11px] md:text-xs text-slate-600 font-medium leading-tight">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
