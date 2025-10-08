import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const statusEmoji = {
  active: '🟢',
  pending: '🟡',
  completed: '✅',
};

export default function Objects() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const projects = userData?.projects || [];

  const siteData = sites.map(site => {
    const project = projects.find(p => p.id === site.project_id);
    const siteWorks = works.filter(w => w.object_id === site.id);
    return {
      ...site,
      projectName: project?.title || '',
      worksCount: siteWorks.length,
      works: siteWorks,
    };
  });

  const filteredSites = siteData.filter((site) => {
    const matchesSearch = site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || site.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSiteClick = (site: typeof siteData[0]) => {
    navigate(`/projects/${site.project_id}/objects/${site.id}`);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Объекты</h1>
        
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по названию, адресу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Все ({sites.length})
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            В работе ({sites.filter(s => s.status === 'active').length})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            Ожидание ({sites.filter(s => s.status === 'pending').length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site, index) => (
            <Card
              key={site.id}
              className="cursor-pointer hover:shadow-lg transition-all animate-fade-in group"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleSiteClick(site)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {site.title}
                  </h3>
                  <span className="text-lg">{statusEmoji[site.status]}</span>
                </div>

                {user?.role === 'client' && site.works[0]?.contractor_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Icon name="User" size={14} />
                    <span>{site.works[0].contractor_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Icon name="Wrench" size={14} />
                    {site.worksCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icon name="Building2" size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Объекты не найдены</h3>
            <p className="text-slate-600">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}