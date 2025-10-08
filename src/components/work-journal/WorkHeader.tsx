import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface WorkHeaderProps {
  selectedWorkData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function WorkHeader({ selectedWorkData, activeTab, setActiveTab }: WorkHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-3 md:px-6 pt-3 md:pt-4 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h2 className="text-base md:text-xl font-bold truncate">{selectedWorkData.title}</h2>
          {selectedWorkData.contractor_name && (
            <p className="text-xs md:text-sm text-slate-600 truncate flex items-center gap-1 mt-1">
              <Icon name="User" size={14} />
              {selectedWorkData.contractor_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Search" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Star" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Bell" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={18} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b-0 h-auto p-0 gap-4">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
          >
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
          >
            Info / Log
          </TabsTrigger>
          <TabsTrigger 
            value="description" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
          >
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="subtasks" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
          >
            Subtasks
          </TabsTrigger>
          <TabsTrigger 
            value="estimate" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
          >
            Estimate
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
