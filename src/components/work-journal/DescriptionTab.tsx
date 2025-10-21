import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DescriptionTabProps {
  selectedWorkData: any;
}

export default function DescriptionTab({ selectedWorkData }: DescriptionTabProps) {
  const regulatoryDocs = [
    {
      type: 'ГОСТ',
      number: 'ГОСТ 23478-79',
      title: 'Крыльца для зданий и сооружений. Общие технические условия',
      url: 'https://docs.cntd.ru/document/1200003609'
    },
    {
      type: 'СНиП',
      number: 'СП 118.13330.2012',
      title: 'Общественные здания и сооружения (актуализированная редакция СНиП 31-06-2009)',
      url: 'https://docs.cntd.ru/document/1200092705'
    },
    {
      type: 'СНиП',
      number: 'СП 54.13330.2016',
      title: 'Здания жилые многоквартирные (актуализированная редакция СНиП 31-01-2003)',
      url: 'https://docs.cntd.ru/document/456054198'
    },
    {
      type: 'ГОСТ',
      number: 'ГОСТ 25772-83',
      title: 'Ограждения лестниц, балконов и крыш стальные. Общие технические условия',
      url: 'https://docs.cntd.ru/document/1200007402'
    },
    {
      type: 'СНиП',
      number: 'СП 70.13330.2012',
      title: 'Несущие и ограждающие конструкции (актуализированная редакция СНиП 3.03.01-87)',
      url: 'https://docs.cntd.ru/document/1200092705'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="space-y-3 md:space-y-4">
          {regulatoryDocs.map((doc, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        doc.type === 'ГОСТ' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {doc.type}
                      </span>
                      <span className="font-mono text-xs text-slate-700">
                        {doc.number}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-slate-900 leading-snug">
                      {doc.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}