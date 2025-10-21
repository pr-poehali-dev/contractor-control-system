import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useWorkForm } from '@/components/work-form/useWorkForm';
import { WorkFormCard } from '@/components/work-form/WorkFormCard';
import { InfoSection } from '@/components/work-form/InfoSection';

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
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            К объекту
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Управление объектом и работами</h1>
          <p className="text-slate-600">Отредактируйте информацию об объекте и управляйте работами</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={20} />
              Информация об объекте
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="object-name">Название объекта</Label>
                <Input
                  id="object-name"
                  value={objectData.name}
                  onChange={(e) => updateObjectField('name', e.target.value)}
                  placeholder="Введите название объекта"
                />
              </div>
              <div>
                <Label htmlFor="object-address">Адрес</Label>
                <Input
                  id="object-address"
                  value={objectData.address}
                  onChange={(e) => updateObjectField('address', e.target.value)}
                  placeholder="Адрес объекта"
                />
              </div>
              <div>
                <Label htmlFor="object-customer">Заказчик</Label>
                <Input
                  id="object-customer"
                  value={objectData.customer}
                  onChange={(e) => updateObjectField('customer', e.target.value)}
                  placeholder="Название заказчика"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="object-description">Описание</Label>
                <Textarea
                  id="object-description"
                  value={objectData.description}
                  onChange={(e) => updateObjectField('description', e.target.value)}
                  placeholder="Краткое описание объекта"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={saveObject} variant="outline" disabled={isSubmitting}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить объект
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Работы</h2>
          <Button
            type="button"
            onClick={addWork}
            size="sm"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить работу
          </Button>
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