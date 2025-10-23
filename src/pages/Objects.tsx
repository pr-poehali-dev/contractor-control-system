import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteObject } from '@/store/slices/objectsSlice';
import { useToast } from '@/hooks/use-toast';
import ObjectsMobileHeader from '@/components/objects/ObjectsMobileHeader';
import ObjectsDesktopHeader from '@/components/objects/ObjectsDesktopHeader';
import ObjectsMobileList from '@/components/objects/ObjectsMobileList';
import ObjectsGridView from '@/components/objects/ObjectsGridView';
import ObjectsTableView from '@/components/objects/ObjectsTableView';
import ObjectsEmptyState from '@/components/objects/ObjectsEmptyState';
import { getObjectStatusInfo } from '@/utils/workStatus';
import { safeDateCompare } from '@/utils/dateValidation';

type ViewMode = 'grid' | 'table';

export default function Objects() {
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<string>('date');
  const isContractor = user?.role === 'contractor';

  const handleDeleteObject = async (objectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) {
      return;
    }
    try {
      await dispatch(deleteObject(objectId)).unwrap();
      toast({ title: 'Объект удалён' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: error instanceof Error ? error.message : 'Не удалось удалить',
        variant: 'destructive'
      });
    }
  };

  const objects = useAppSelector((state) => state.objects.items);
  const works = useAppSelector((state) => state.works.items);
  const unreadCounts = useAppSelector((state) => state.user.userData?.unreadCounts || {});
  
  console.log('🔔 unreadCounts:', unreadCounts);

  const objectData = objects.map(obj => {
    const objectWorks = works.filter(w => w.object_id === obj.id);
    const completedWorks = objectWorks.filter(w => w.completion_percentage >= 100).length;
    const progress = objectWorks.length > 0 
      ? Math.round(objectWorks.reduce((sum, w) => sum + (w.completion_percentage || 0), 0) / objectWorks.length)
      : 0;
    
    const statusInfo = getObjectStatusInfo(objectWorks);
    
    const totalMessages = objectWorks.reduce((sum, w) => sum + (unreadCounts[w.id]?.messages || 0), 0);
    const totalLogs = objectWorks.reduce((sum, w) => sum + (unreadCounts[w.id]?.logs || 0), 0);
    const totalInspections = objectWorks.reduce((sum, w) => sum + (unreadCounts[w.id]?.inspections || 0), 0);
    
    return {
      ...obj,
      worksCount: objectWorks.length,
      works: objectWorks,
      progress,
      completedWorks,
      calculatedStatus: statusInfo.status,
      statusMessage: statusInfo.message,
      statusColor: statusInfo.color,
      statusIcon: statusInfo.icon,
      unreadMessages: totalMessages,
      unreadLogs: totalLogs,
      unreadInspections: totalInspections,
    };
  });

  let filteredObjects = objectData.filter((obj) => {
    const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (obj.address && obj.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (obj.description && obj.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || obj.calculatedStatus === selectedStatus;
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
      safeDateCompare(a.created_at, b.created_at)
    );
  }

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'planning', label: 'Запланировано' },
    { value: 'active', label: 'Работы начаты' },
    { value: 'completed', label: 'Работы завершены' }
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