export const extractVariables = (html: string): string[] => {
  const matches1 = html.match(/{{([^}]+)}}/g) || [];
  const matches2 = html.match(/\[([^\]]+)\]/g) || [];
  const allMatches = [...matches1, ...matches2];
  
  if (allMatches.length === 0) return [];
  
  const variables = allMatches.map(m => 
    m.replace(/[{}\[\]]/g, '').trim()
  );
  
  return [...new Set(variables)];
};

export const replaceVariables = (html: string, data: Record<string, any>): string => {
  let result = html;
  Object.entries(data).forEach(([key, value]) => {
    const regex1 = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex1, String(value || ''));
    
    const regex2 = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex2, String(value || ''));
  });
  return result;
};

export const handleDownloadPDF = (document: any, replaceVariables: (html: string, data: Record<string, any>) => string) => {
  const content = replaceVariables(document?.htmlContent || '', document?.contentData || {});

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${document?.title || 'Документ'}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px; 
              line-height: 1.6;
              color: #000;
            }
            h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
            p { margin: 0.5em 0; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
