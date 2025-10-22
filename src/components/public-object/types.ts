export interface Work {
  id: number;
  title: string;
  description: string;
  object_id: number;
  status: string;
  contractor_name?: string;
  start_date?: string;
  end_date?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  completion_percentage?: number;
  progress?: string;
}

export interface BuildingObject {
  id: number;
  title: string;
  address?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}