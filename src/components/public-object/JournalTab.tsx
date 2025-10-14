import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Work } from './types';

interface JournalTabProps {
  works: Work[];
}

const JournalTab = ({ works }: JournalTabProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Журнал работ</h2>
      {works.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Нет работ в журнале</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <Card key={work.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                {work.description && (
                  <p className="text-sm text-slate-600 mb-2">{work.description}</p>
                )}
                {work.contractor_name && (
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Icon name="Users" size={14} />
                    {work.contractor_name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalTab;
