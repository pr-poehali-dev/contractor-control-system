import { useState, useEffect } from 'react';
import { Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PdfPreviewDialogProps {
  template: Template | null;
}

export function PdfPreviewDialog({ template }: PdfPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && template) {
      const fields: Record<string, string> = {};
      template.schemas.forEach((page) => {
        page.forEach((field) => {
          if (field.type === 'text') {
            fields[field.name] = '';
          } else if (field.type === 'qrcode') {
            fields[field.name] = 'https://example.com';
          }
        });
      });
      setFormData(fields);
    }
  }, [open, template]);

  const handleGenerate = async () => {
    if (!template) return;
    
    setIsGenerating(true);
    try {
      const inputs = [formData];
      
      const pdf = await generate({
        template,
        inputs,
      });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Ошибка при генерации PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    link.click();
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setOpen(false);
  };

  if (!template) return null;

  const textFields = Object.keys(formData).filter((key) => {
    const field = template.schemas
      .flat()
      .find((f) => f.name === key);
    return field?.type === 'text';
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="Eye" size={16} className="mr-2" />
          Предпросмотр
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Предпросмотр и экспорт PDF</DialogTitle>
          <DialogDescription>
            Заполните поля и сгенерируйте готовый документ
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <Icon name="FileInput" size={16} />
                Данные для документа
              </div>
              
              {textFields.length === 0 ? (
                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                  В шаблоне нет текстовых полей
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {textFields.map((fieldName) => {
                    const field = template.schemas.flat().find((f) => f.name === fieldName);
                    const isLargeField = field && 'height' in field && field.height && field.height > 30;
                    
                    return (
                      <div key={fieldName}>
                        <Label className="text-xs text-gray-600 capitalize">
                          {fieldName.replace(/_/g, ' ')}
                        </Label>
                        {isLargeField ? (
                          <Textarea
                            value={formData[fieldName] || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, [fieldName]: e.target.value })
                            }
                            placeholder={`Введите ${fieldName.replace(/_/g, ' ')}`}
                            rows={4}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            value={formData[fieldName] || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, [fieldName]: e.target.value })
                            }
                            placeholder={`Введите ${fieldName.replace(/_/g, ' ')}`}
                            className="text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Icon name="FileOutput" size={16} className="mr-2" />
                      Сгенерировать PDF
                    </>
                  )}
                </Button>
                
                {pdfUrl && (
                  <Button onClick={handleDownload} variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Предпросмотр документа
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[500px]"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-gray-400">
                    <div className="text-center space-y-3">
                      <Icon name="FileQuestion" size={48} className="mx-auto opacity-50" />
                      <p className="text-sm">
                        Заполните данные и нажмите<br />"Сгенерировать PDF"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
