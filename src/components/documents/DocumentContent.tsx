interface DocumentContentProps {
  documentHtml: string;
}

export default function DocumentContent({ documentHtml }: DocumentContentProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-8 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: documentHtml || 'Нет содержимого' }} />
    </div>
  );
}
