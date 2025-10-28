import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentPreviewProps {
  html: string;
  variables: Record<string, string>;
  templateName: string;
}

export default function DocumentPreview({ html, variables, templateName }: DocumentPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const replaceVariables = (content: string): string => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      // Заменяем переменные в формате {{key}}
      const regex1 = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex1, value ? `<span class="variable-filled">${value}</span>` : `<span class="variable-empty">{{${key}}}</span>`);
      
      // Заменяем переменные в формате {key} (без двойных скобок)
      const regex2 = new RegExp(`{\\s*${key}\\s*}`, 'g');
      result = result.replace(regex2, value ? `<span class="variable-filled">${value}</span>` : `<span class="variable-empty">{${key}}</span>`);
    });
    return result;
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${templateName || 'document'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const processedHtml = replaceVariables(html);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Icon name="Eye" size={18} className="text-slate-600" />
          <span className="font-medium text-sm">Предпросмотр документа</span>
        </div>
        <Button onClick={handleDownloadPDF} size="sm">
          <Icon name="Download" size={16} className="mr-2" />
          Скачать PDF
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div
            ref={previewRef}
            className="prose prose-slate max-w-none p-12 min-h-[297mm]"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          />
        </div>
      </div>

      <style>{`
        .variable-filled {
          background-color: #dbeafe;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 500;
          color: #1e40af;
        }
        .variable-empty {
          background-color: #fee2e2;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 500;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
}