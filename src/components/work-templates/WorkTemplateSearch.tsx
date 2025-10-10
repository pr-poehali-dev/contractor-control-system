import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CATEGORIES } from './types';

interface WorkTemplateSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  isAdmin: boolean;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  addDialogContent: React.ReactNode;
}

const WorkTemplateSearch = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  isAdmin,
  isAddOpen,
  onAddOpenChange,
  addDialogContent,
}: WorkTemplateSearchProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Поиск работ..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="md:w-64">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить работу
                </Button>
              </DialogTrigger>
              {addDialogContent}
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkTemplateSearch;
