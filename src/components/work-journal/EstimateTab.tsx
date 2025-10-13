import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimateTabProps {
  handleCreateEstimate: () => void;
}

interface EstimateVersion {
  id: number;
  version: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  xmlFile?: string;
  xlsxFile?: string;
  data?: {
    items: Array<{
      name: string;
      quantity: string;
      price: string;
      total: string;
    }>;
    total: number;
    budget: number;
    spent: number;
  };
}

const mockVersions: EstimateVersion[] = [
  {
    id: 1,
    version: '1.0',
    createdAt: '2025-10-01T10:00:00',
    createdBy: 'Иван Петров',
    isActive: true,
    xmlFile: 'smeta_v1.xml',
    xlsxFile: 'smeta_v1.xlsx',
    data: {
      items: [
        { name: 'Материалы', quantity: '100 кг', price: '50 000 ₽', total: '50 000 ₽' },
        { name: 'Работа', quantity: '20 часов', price: '2 000 ₽/час', total: '40 000 ₽' },
        { name: 'Доставка', quantity: '1', price: '10 000 ₽', total: '10 000 ₽' },
      ],
      total: 100000,
      budget: 100000,
      spent: 45000,
    },
  },
  {
    id: 2,
    version: '0.9',
    createdAt: '2025-09-25T14:30:00',
    createdBy: 'Мария Сидорова',
    isActive: false,
    xmlFile: 'smeta_v0.9.xml',
    xlsxFile: 'smeta_v0.9.xlsx',
  },
];

export default function EstimateTab({ handleCreateEstimate }: EstimateTabProps) {
  const [versions, setVersions] = useState<EstimateVersion[]>(mockVersions);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadXmlFile, setUploadXmlFile] = useState<File | null>(null);
  const [uploadXlsxFile, setUploadXlsxFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState('');
  const { toast } = useToast();

  const activeVersion = versions.find((v) => v.isActive);

  const handleSetActive = (versionId: number) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isActive: v.id === versionId,
      }))
    );
    toast({
      title: 'Версия сметы активирована',
      description: `Версия ${versions.find((v) => v.id === versionId)?.version} установлена как актуальная`,
    });
  };

  const handleUploadEstimate = () => {
    if (!uploadXmlFile || !uploadXlsxFile || !uploadVersion) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо загрузить оба файла (XML и XLSX) и указать версию',
        variant: 'destructive',
      });
      return;
    }

    const newVersion: EstimateVersion = {
      id: Date.now(),
      version: uploadVersion,
      createdAt: new Date().toISOString(),
      createdBy: 'Текущий пользователь',
      isActive: false,
      xmlFile: uploadXmlFile.name,
      xlsxFile: uploadXlsxFile.name,
    };

    setVersions((prev) => [newVersion, ...prev]);
    setIsUploadDialogOpen(false);
    setUploadXmlFile(null);
    setUploadXlsxFile(null);
    setUploadVersion('');

    toast({
      title: 'Смета загружена',
      description: `Версия ${uploadVersion} успешно добавлена`,
    });
  };

  const handleDownloadFile = (filename: string) => {
    toast({
      title: 'Скачивание файла',
      description: `Файл ${filename} будет загружен`,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 md:p-8 lg:p-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-2xl lg:text-3xl font-bold truncate">Смета</h3>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5 md:mt-1 hidden md:block">
              Управление версиями сметной документации
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} size="sm" className="md:h-10 flex-shrink-0">
            <Icon name="Upload" size={16} className="md:mr-2 md:w-[18px] md:h-[18px]" />
            <span className="hidden md:inline">Загрузить</span>
          </Button>
        </div>

        {activeVersion?.data ? (
          <>
            <Card className="mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm md:text-lg font-semibold break-words">
                      Актуальная версия: {activeVersion.version}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-600 break-words">
                      Загружена {new Date(activeVersion.createdAt).toLocaleDateString('ru-RU')} • {activeVersion.createdBy}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 flex-shrink-0 text-[10px] md:text-xs">Актуальная</Badge>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-3 mt-4">
                  {activeVersion.xmlFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(activeVersion.xmlFile!)}
                      className="w-full md:w-auto text-xs md:text-sm justify-start"
                    >
                      <Icon name="FileText" size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{activeVersion.xmlFile}</span>
                    </Button>
                  )}
                  {activeVersion.xlsxFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(activeVersion.xlsxFile!)}
                      className="w-full md:w-auto text-xs md:text-sm justify-start"
                    >
                      <Icon name="Sheet" size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{activeVersion.xlsxFile}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-2 md:p-5 text-xs md:text-lg font-semibold text-slate-700">
                          Наименование
                        </th>
                        <th className="text-left p-2 md:p-5 text-xs md:text-lg font-semibold text-slate-700">
                          Количество
                        </th>
                        <th className="text-right p-2 md:p-5 text-xs md:text-lg font-semibold text-slate-700">
                          Итого
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVersion.data.items.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 md:p-5 text-xs md:text-lg break-words">{item.name}</td>
                          <td className="p-2 md:p-5 text-xs md:text-lg text-slate-600 whitespace-nowrap">{item.quantity}</td>
                          <td className="p-2 md:p-5 text-xs md:text-lg font-semibold text-right whitespace-nowrap">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={2} className="p-2 md:p-5 text-sm md:text-lg font-semibold">
                          Итого:
                        </td>
                        <td className="p-2 md:p-5 text-base md:text-xl font-bold text-right whitespace-nowrap">
                          {activeVersion.data.total.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8">
              <Card>
                <CardContent className="p-3 md:p-5">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Calculator" size={20} className="text-blue-600 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-slate-600">Бюджет</p>
                      <p className="text-sm md:text-xl font-bold break-words">
                        {activeVersion.data.budget.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-5">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="TrendingDown" size={20} className="text-green-600 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-slate-600">Потрачено</p>
                      <p className="text-sm md:text-xl font-bold break-words">
                        {activeVersion.data.spent.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-5">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Wallet" size={20} className="text-purple-600 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-slate-600">Остаток</p>
                      <p className="text-sm md:text-xl font-bold break-words">
                        {(activeVersion.data.budget - activeVersion.data.spent).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Icon name="FileSpreadsheet" size={64} className="mx-auto text-slate-300 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Нет активной сметы</h4>
              <p className="text-slate-600 mb-6">
                Загрузите смету в формате XML и XLSX для начала работы
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить смету
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">История версий</h4>
          <div className="space-y-3">
            {versions.map((version) => (
              <Card key={version.id} className={version.isActive ? 'border-green-500 border-2' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-semibold text-lg">Версия {version.version}</h5>
                        {version.isActive && (
                          <Badge className="bg-green-100 text-green-700">Актуальная</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Загружена {new Date(version.createdAt).toLocaleDateString('ru-RU')} в{' '}
                        {new Date(version.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {version.createdBy}
                      </p>
                      <div className="flex gap-2">
                        {version.xmlFile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(version.xmlFile!)}
                          >
                            <Icon name="FileText" size={14} className="mr-1" />
                            XML
                          </Button>
                        )}
                        {version.xlsxFile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(version.xlsxFile!)}
                          >
                            <Icon name="Sheet" size={14} className="mr-1" />
                            XLSX
                          </Button>
                        )}
                      </div>
                    </div>
                    {!version.isActive && version.xmlFile && version.xlsxFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(version.id)}
                      >
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Сделать актуальной
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Загрузить смету</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version">Версия сметы</Label>
              <Input
                id="version"
                placeholder="Например: 2.0"
                value={uploadVersion}
                onChange={(e) => setUploadVersion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xml-file">XML файл</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="xml-file"
                  type="file"
                  accept=".xml"
                  onChange={(e) => setUploadXmlFile(e.target.files?.[0] || null)}
                />
                {uploadXmlFile && (
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xlsx-file">XLSX файл</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="xlsx-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadXlsxFile(e.target.files?.[0] || null)}
                />
                {uploadXlsxFile && (
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                )}
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Требования к файлам:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Оба файла (XML и XLSX) обязательны</li>
                      <li>Файлы будут обработаны и данные визуализированы</li>
                      <li>После загрузки версию можно установить как актуальную</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUploadEstimate}>
              <Icon name="Upload" size={16} className="mr-2" />
              Загрузить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}