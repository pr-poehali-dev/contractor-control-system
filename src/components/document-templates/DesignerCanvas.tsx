import { forwardRef } from 'react';

interface DesignerCanvasProps {
  isReady: boolean;
}

export const DesignerCanvas = forwardRef<HTMLDivElement, DesignerCanvasProps>(
  ({ isReady }, ref) => {
    return (
      <>
        <div 
          ref={ref} 
          className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white"
          style={{ 
            minHeight: '800px',
            height: 'calc(100vh - 400px)',
          }}
        />

        {!isReady && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600 font-medium">Загрузка редактора...</p>
            </div>
          </div>
        )}
      </>
    );
  }
);

DesignerCanvas.displayName = 'DesignerCanvas';
