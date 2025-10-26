import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import DocumentViewer from '@/components/documents/DocumentViewer';

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Документ не найден</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад к документам
          </Button>
        </div>

        <DocumentViewer documentId={parseInt(id)} />
      </div>
    </div>
  );
}
