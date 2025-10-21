import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useWorkForm } from '@/components/work-form/useWorkForm';
import { WorkFormCard } from '@/components/work-form/WorkFormCard';
import { InfoSection } from '@/components/work-form/InfoSection';

const CreateWork = () => {
  const { objectId } = useParams();
  const {
    works,
    isLoading,
    isSubmitting,
    contractors,
    workTemplates,
    categories,
    addWork,
    removeWork,
    duplicateWork,
    updateWork,
    handleSubmit,
    handleCancel,
  } = useWorkForm(objectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Загрузка работ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            К объекту
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Управление работами</h1>
          <p className="text-slate-600">Добавьте новые работы или отредактируйте существующие</p>
        </div>

        <InfoSection />

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {works.map((work, index) => (
              <WorkFormCard
                key={work.id}
                work={work}
                index={index}
                categories={categories}
                workTemplates={workTemplates}
                contractors={contractors}
                onUpdate={updateWork}
                onDuplicate={duplicateWork}
                onRemove={removeWork}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addWork}
              className="w-full sm:w-auto"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить ещё работу
            </Button>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} className="mr-2" />
                  Сохранить работы
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWork;
