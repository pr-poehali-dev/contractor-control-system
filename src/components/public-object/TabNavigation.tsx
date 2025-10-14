interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="container max-w-4xl mx-auto px-4 pb-3">
      <div className="space-y-2 w-full">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onTabChange('journal')}
            className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
              activeTab === 'journal' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Журнал работ
          </button>
          <button
            onClick={() => onTabChange('schedule')}
            className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
              activeTab === 'schedule' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            График
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Аналитика
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTabChange('inspections')}
            className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
              activeTab === 'inspections' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Проверки
          </button>
          <button
            onClick={() => onTabChange('info')}
            className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
              activeTab === 'info' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Общая информация
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
