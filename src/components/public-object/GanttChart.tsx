import { Work } from './types';

interface GanttChartProps {
  works: Work[];
}

const GanttChart = ({ works }: GanttChartProps) => {
  const sortedWorks = [...works].sort((a, b) => 
    new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime()
  );

  const allDates = sortedWorks.flatMap(w => [
    new Date(w.start_date!).getTime(),
    new Date(w.end_date!).getTime()
  ]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

  const getMonthsInRange = () => {
    const months: { label: string; days: number }[] = [];
    const current = new Date(minDate);
    
    while (current.getTime() <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const rangeStart = Math.max(monthStart.getTime(), minDate);
      const rangeEnd = Math.min(monthEnd.getTime(), maxDate);
      const days = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
      
      months.push({
        label: current.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        days
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const months = getMonthsInRange();

  return (
    <div className="space-y-2">
      <div className="flex border-b border-slate-200 pb-2 mb-4">
        <div className="w-48 flex-shrink-0" />
        <div className="flex-1 flex">
          {months.map((month, idx) => (
            <div 
              key={idx}
              className="text-xs font-medium text-slate-600 text-center border-l border-slate-200 px-2"
              style={{ width: `${(month.days / totalDays) * 100}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      {sortedWorks.map((work) => {
        const workStart = new Date(work.start_date!).getTime();
        const workEnd = new Date(work.end_date!).getTime();
        const offsetDays = Math.ceil((workStart - minDate) / (1000 * 60 * 60 * 24));
        const durationDays = Math.ceil((workEnd - workStart) / (1000 * 60 * 60 * 24)) + 1;
        const leftPercent = (offsetDays / totalDays) * 100;
        const widthPercent = (durationDays / totalDays) * 100;

        return (
          <div key={work.id} className="flex items-center gap-2 py-2 hover:bg-slate-50 rounded">
            <div className="w-48 flex-shrink-0 pr-4">
              <p className="text-sm font-medium text-slate-900 truncate">{work.title}</p>
              {work.contractor_name && (
                <p className="text-xs text-slate-500 truncate">{work.contractor_name}</p>
              )}
            </div>
            <div className="flex-1 relative h-8">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="absolute h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium shadow-sm"
                  style={{ 
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    minWidth: '60px'
                  }}
                >
                  {durationDays}д
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GanttChart;
