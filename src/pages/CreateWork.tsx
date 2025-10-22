import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useWorkForm } from '@/components/work-form/useWorkForm';
import { WorkFormCard } from '@/components/work-form/WorkFormCard';
import { InfoSection } from '@/components/work-form/InfoSection';
import { ObjectInfoSection } from '@/components/work-form/ObjectInfoSection';

const CreateWork = () => {
  const { objectId } = useParams();
  const {
    works,
    objectData,
    isLoading,
    isSubmitting,
    contractors,
    workTemplates,
    categories,
    addWork,
    removeWork,
    duplicateWork,
    updateWork,
    updateObjectField,
    saveObject,
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
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <button 
              onClick={handleCancel}
              className="flex-shrink-0 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={20} className="text-slate-600" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold flex-1 min-w-0 truncate">{objectData.name || 'Загрузка...'}</h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 ml-10 md:ml-12">Управление объектом и работами</p>
        </div>

        <ObjectInfoSection 
          objectData={objectData}
          updateObjectField={updateObjectField}
          saveObject={saveObject}
          isSubmitting={isSubmitting}
        />

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Работы</h2>
        </div>

        <InfoSection />

        <form onSubmit={handleSubmit}>
          {works.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
              <Icon name="Briefcase" size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-4">У этого объекта пока нет работ</p>
              <Button type="button" onClick={addWork}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить первую работу
              </Button>
            </div>
          ) : (
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

              <button
                type="button"
                onClick={addWork}
                className="w-full p-6 bg-white border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <Icon name="Plus" size={24} />
              </button>
            </div>
          )}

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