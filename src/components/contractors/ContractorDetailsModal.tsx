import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  project_id: number;
  project_name: string;
  object_id: number | null;
  object_name: string | null;
  work_id: number | null;
  work_title: string | null;
  status: string;
  assigned_at: string;
}

interface ContractorDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: any;
}

const ContractorDetailsModal = ({
  open,
  onOpenChange,
  contractor,
}: ContractorDetailsModalProps) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && contractor?.id) {
      loadAssignments();
    }
  }, [open, contractor?.id]);

  const loadAssignments = async () => {
    if (!contractor?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/4bcd4efc-3b22-4eea-9434-44cc201a86f8?contractor_id=${contractor.id}&with_assignments=true`
      );
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigateToProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
    onOpenChange(false);
  };

  const handleNavigateToObject = (projectId: number, objectId: number) => {
    navigate(`/projects/${projectId}/objects/${objectId}`);
    onOpenChange(false);
  };

  const handleNavigateToWork = (projectId: number, objectId: number, workId: number) => {
    navigate(`/projects/${projectId}/objects/${objectId}/works/${workId}`);
    onOpenChange(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      pending: { label: 'Ожидает', variant: 'secondary' },
      in_progress: { label: 'В работе', variant: 'default' },
      completed: { label: 'Завершено', variant: 'outline' },
      cancelled: { label: 'Отменено', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    );
  };

  if (!contractor) return null;

  // Group assignments by project
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.project_id]) {
      acc[assignment.project_id] = {
        project_name: assignment.project_name,
        project_id: assignment.project_id,
        items: [],
      };
    }
    acc[assignment.project_id].items.push(assignment);
    return acc;
  }, {} as Record<number, { project_name: string; project_id: number; items: Assignment[] }>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                {getInitials(contractor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {contractor.name}
              </DialogTitle>
              <Badge variant="outline">
                <Icon name="Building2" size={14} className="mr-1" />
                Подрядчик
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Основная информация */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Основная информация
            </h3>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ИНН</p>
                    <p className="text-sm font-medium text-slate-900">
                      {contractor.inn || '—'}
                    </p>
                  </div>
                  {contractor.user?.email && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {contractor.user.email}
                      </p>
                    </div>
                  )}
                  {contractor.user?.phone && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Телефон</p>
                      <p className="text-sm font-medium text-slate-900">
                        {contractor.user.phone}
                      </p>
                    </div>
                  )}
                  {contractor.added_at && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Добавлен</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(contractor.added_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Назначения */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Icon name="Briefcase" size={16} />
              Назначения на проекты ({assignments.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" size={32} className="animate-spin text-slate-400 mx-auto" />
              </div>
            ) : assignments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    Подрядчик пока не назначен ни на один проект
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.values(groupedAssignments).map((group) => (
                  <Card key={group.project_id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="FolderKanban" size={20} className="text-blue-600" />
                          <h4 className="font-semibold text-slate-900">
                            {group.project_name}
                          </h4>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleNavigateToProject(group.project_id)}
                        >
                          <Icon name="ExternalLink" size={14} className="mr-1" />
                          Открыть
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {group.items.map((assignment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex-1 space-y-1">
                              {assignment.object_name && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Icon name="Building" size={14} className="text-slate-400" />
                                  <span className="font-medium text-slate-700">
                                    {assignment.object_name}
                                  </span>
                                </div>
                              )}
                              {assignment.work_title && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Icon name="Wrench" size={14} className="text-slate-400" />
                                  <span className="text-slate-600">
                                    {assignment.work_title}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Icon name="Calendar" size={12} />
                                {new Date(assignment.assigned_at).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(assignment.status)}
                              {assignment.object_id && assignment.work_id ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleNavigateToWork(
                                      assignment.project_id,
                                      assignment.object_id!,
                                      assignment.work_id!
                                    )
                                  }
                                >
                                  <Icon name="ArrowRight" size={14} />
                                </Button>
                              ) : assignment.object_id ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleNavigateToObject(
                                      assignment.project_id,
                                      assignment.object_id!
                                    )
                                  }
                                >
                                  <Icon name="ArrowRight" size={14} />
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorDetailsModal;