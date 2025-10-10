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
    <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl font-bold">Нормативная документация</h3>
          <Button variant="outline">
            <Icon name="Edit" size={18} className="mr-2" />
            Редактировать
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon name="FileText" size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">{selectedWorkData.title}</h4>
                <p className="text-slate-600">
                  Применимые стандарты, нормы и правила для данного вида работ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {regulatoryDocs.map((doc, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.type === 'ГОСТ' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {doc.type}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {doc.number}
                      </span>
                    </div>
                    <p className="text-slate-900 font-medium mb-1">
                      {doc.title}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    className="flex-shrink-0"
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-900 mb-1">Важно</h5>
                <p className="text-sm text-amber-800">
                  Все работы должны выполняться в строгом соответствии с указанными нормативными документами. 
                  При обнаружении несоответствий необходимо немедленно сообщить в проектный офис.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}