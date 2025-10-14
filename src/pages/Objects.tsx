import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ObjectsMobileHeader from '@/components/objects/ObjectsMobileHeader';
import ObjectsDesktopHeader from '@/components/objects/ObjectsDesktopHeader';
import ObjectsMobileList from '@/components/objects/ObjectsMobileList';
import ObjectsGridView from '@/components/objects/ObjectsGridView';
import ObjectsTableView from '@/components/objects/ObjectsTableView';
import ObjectsEmptyState from '@/components/objects/ObjectsEmptyState';

type ViewMode = 'grid' | 'table';

export default function Objects() {
  const navigate = useNavigate();
  const { user, token, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<string>('date');
  const isContractor = user?.role === 'contractor';

  const handleDeleteObject = async (objectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return;
    try {
      await api.deleteItem(token!, 'object', objectId);
      if (token) {
        const refreshed = await api.getUserData(token);
        setUserData(refreshed);
      }
      toast({ title: 'Объект удалён' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось удалить',
        variant: 'destructive'
      });
    }
  };

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];

  const objectData = objects.map(obj => {
    const objectWorks = works.filter(w => w.object_id === obj.id);
    const completedWorks = objectWorks.filter(w => w.status === 'completed').length;
    const progress = objectWorks.length > 0 
      ? Math.round((completedWorks / objectWorks.length) * 100)
      : 0;
    
    return {
      ...obj,
      worksCount: objectWorks.length,
      works: objectWorks,
      progress,
      completedWorks,
    };
  });

  let filteredObjects = objectData.filter((obj) => {
    const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (obj.address && obj.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (obj.description && obj.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || obj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (sortBy === 'name') {
    filteredObjects = [...filteredObjects].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'progress') {
    filteredObjects = [...filteredObjects].sort((a, b) => b.progress - a.progress);
  } else if (sortBy === 'works') {
    filteredObjects = [...filteredObjects].sort((a, b) => b.worksCount - a.worksCount);
  } else {
    filteredObjects = [...filteredObjects].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'planning', label: 'Планирование' },
    { value: 'active', label: 'В работе' },
    { value: 'completed', label: 'Завершён' },
    { value: 'on_hold', label: 'Приостановлен' }
  ];

  const handleObjectClick = (objectId: number) => {
    navigate(`/objects/${objectId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="block md:hidden">
        <ObjectsMobileHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusOptions={statusOptions}
          onCreateClick={() => navigate('/objects/create')}
          isContractor={isContractor}
        />
        
        {filteredObjects.length === 0 ? (
          <ObjectsEmptyState 
            searchQuery={searchQuery}
            onCreateClick={() => navigate('/objects/create')}
            isContractor={isContractor}
          />
        ) : (
          <ObjectsMobileList 
            sites={filteredObjects}
            onSiteClick={handleObjectClick}
            onDeleteSite={handleDeleteObject}
            isContractor={isContractor}
          />
        )}
      </div>

      <div className="hidden md:block p-8">
        <ObjectsDesktopHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusOptions={statusOptions}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onCreateClick={() => navigate('/objects/create')}
          isContractor={isContractor}
        />

        {filteredObjects.length === 0 ? (
          <ObjectsEmptyState 
            searchQuery={searchQuery}
            onCreateClick={() => navigate('/objects/create')}
            isContractor={isContractor}
          />
        ) : viewMode === 'grid' ? (
          <ObjectsGridView 
            sites={filteredObjects}
            onSiteClick={handleObjectClick}
            onDeleteSite={handleDeleteObject}
            isContractor={isContractor}
          />
        ) : (
          <ObjectsTableView 
            sites={filteredObjects}
            onSiteClick={handleObjectClick}
            onDeleteSite={handleDeleteObject}
            isContractor={isContractor}
          />
        )}
      </div>
    </div>
  );
}