import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface JournalEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    projectId: string;
    objectId: string;
    workId: string;
    description: string;
    volume: string;
    materials: string;
    photoUrls?: string[];
  };
  onFormChange: (form: any) => void;
  projects: any[];
  sites: any[];
  works: any[];
  onSubmit: () => void;
}

const JournalEntryModal = ({ open, onOpenChange, form, onFormChange, projects, sites, works, onSubmit }: JournalEntryModalProps) => {
  const [uploading, setUploading] = useState(false);
  
  const projectSites = sites.filter(s => s.project_id === Number(form.projectId));
  const availableWorks = works.filter(w => w.object_id === Number(form.objectId));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://cdn.poehali.dev/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.url) {
          newUrls.push(data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    onFormChange({
      ...form,
      photoUrls: [...(form.photoUrls || []), ...newUrls]
    });
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newPhotoUrls = [...(form.photoUrls || [])];
    newPhotoUrls.splice(index, 1);
    onFormChange({ ...form, photoUrls: newPhotoUrls });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Создать запись в журнал</DialogTitle>
          <DialogDescription>Добавьте отчет о выполненных работах</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Проект</Label>
            <Select value={form.projectId} onValueChange={(val) => onFormChange({...form, projectId: val, objectId: '', workId: ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите проект" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.projectId && (
            <div>
              <Label>Объект</Label>
              <Select value={form.objectId} onValueChange={(val) => onFormChange({...form, objectId: val, workId: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите объект" />
                </SelectTrigger>
                <SelectContent>
                  {projectSites.map((site: any) => (
                    <SelectItem key={site.id} value={String(site.id)}>{site.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.objectId && (
            <div>
              <Label>Работа</Label>
              <Select value={form.workId} onValueChange={(val) => onFormChange({...form, workId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите работу" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorks.map((w: any) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Описание работ</Label>
            <Textarea 
              placeholder="Опишите выполненные работы..."
              value={form.description}
              onChange={(e) => onFormChange({...form, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Объём</Label>
              <Input 
                placeholder="Например: 50 м²"
                value={form.volume}
                onChange={(e) => onFormChange({...form, volume: e.target.value})}
              />
            </div>
            <div>
              <Label>Материалы</Label>
              <Input 
                placeholder="Например: Кирпич"
                value={form.materials}
                onChange={(e) => onFormChange({...form, materials: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Фотографии</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Icon name="Upload" size={20} className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  {uploading ? 'Загрузка...' : 'Загрузить фотографии'}
                </span>
              </label>

              {form.photoUrls && form.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {form.photoUrls.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSubmit}>
            Создать запись
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryModal;