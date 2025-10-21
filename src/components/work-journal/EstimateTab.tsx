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
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <h4 className="text-lg md:text-xl font-semibold">История версий</h4>
          <Button onClick={() => setIsUploadDialogOpen(true)} size="sm" className="md:h-10 flex-shrink-0">
            <Icon name="Upload" size={16} className="md:mr-2 md:w-[18px] md:h-[18px]" />
            <span className="hidden md:inline">Загрузить</span>
          </Button>
        </div>

        <div className="space-y-3 md:space-y-4">
          {versions.map((version) => (
            <Card
              key={version.id}
              className={version.isActive ? 'border-green-500 bg-green-50' : ''}
            >
              <CardContent className="p-3 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm md:text-lg font-semibold">Версия {version.version}</h5>
                      {version.isActive && (
                        <Badge className="bg-green-100 text-green-700 text-[10px] md:text-xs">Актуальная</Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">
                      Загружена {new Date(version.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} в {new Date(version.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} • {version.createdBy}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {version.xmlFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(version.xmlFile!)}
                          className="h-8 text-xs px-2"
                        >
                          <Icon name="FileText" size={14} className="mr-1.5" />
                          XML
                        </Button>
                      )}
                      {version.xlsxFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(version.xlsxFile!)}
                          className="h-8 text-xs px-2"
                        >
                          <Icon name="Sheet" size={14} className="mr-1.5" />
                          XLSX
                        </Button>
                      )}
                    </div>
                  </div>
                  {!version.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(version.id)}
                      className="w-full md:w-auto text-xs md:text-sm"
                    >
                      <Icon name="CheckCircle2" size={14} className="mr-1.5" />
                      Сделать актуальной
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Загрузить новую версию сметы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version">Номер версии</Label>
              <Input
                id="version"
                placeholder="Например: 1.1"
                value={uploadVersion}
                onChange={(e) => setUploadVersion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xml-file">XML файл</Label>
              <Input
                id="xml-file"
                type="file"
                accept=".xml"
                onChange={(e) => setUploadXmlFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xlsx-file">XLSX файл</Label>
              <Input
                id="xlsx-file"
                type="file"
                accept=".xlsx"
                onChange={(e) => setUploadXlsxFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUploadEstimate}>Загрузить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
