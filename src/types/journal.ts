export type EventType = 
  | 'work_entry'
  | 'work_start'
  | 'inspection'
  | 'inspection_scheduled'
  | 'inspection_started'
  | 'inspection_completed'
  | 'defect_added' 
  | 'act_signed' 
  | 'chat_message'
  | 'material_added'
  | 'photo_added';

export type UserRole = 'contractor' | 'client' | 'customer' | 'supervisor' | 'admin';

export interface JournalEvent {
  id: number;
  type: EventType;
  work_id: number;
  created_by: number;
  author_name: string;
  author_role: UserRole;
  created_at: string;
  content?: string;
  
  work_data?: {
    volume?: number;
    unit?: string;
    materials?: string[];
    photos?: string[];
    progress?: number;
    completion_percentage?: number;
  };
  
  inspection_data?: {
    inspection_id?: number;
    inspection_number?: string;
    status?: 'approved' | 'rejected' | 'pending';
    defects_count?: number;
    defects?: Array<{ description: string; severity: string }>;
    photos?: string[];
    work_log_id?: number;
    scheduled_date?: string;
  };
  
  defect_data?: {
    defect_id: number;
    inspection_id: number;
    inspection_number: string;
    description: string;
    standard_reference?: string;
    photos?: string[];
    status: 'open' | 'in_progress' | 'resolved';
  };
  
  act_data?: {
    act_id: number;
    act_number: string;
    signers?: string[];
  };
}

export interface ControlPoint {
  id: number;
  category: string;
  description: string;
  standard: string;
  standard_clause: string;
  is_critical: boolean;
}

export interface InspectionCheckpoint {
  id: number;
  control_point_id: number;
  control_point: ControlPoint;
  status: 'compliant' | 'non_compliant' | 'not_checked';
  notes?: string;
}

export interface Inspection {
  id: number;
  inspection_number: string;
  work_id: number;
  journal_entry_id?: number;
  created_by: number;
  created_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed';
  checkpoints: InspectionCheckpoint[];
  defects_count: number;
}

export interface Defect {
  id: number;
  inspection_id: number;
  checkpoint_id: number;
  description: string;
  standard_reference: string;
  photos: string[];
  status: 'open' | 'in_progress' | 'resolved';
  created_by: number;
  created_at: string;
  resolved_at?: string;
}

export interface EstimateItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
  category: string;
}

export interface Estimate {
  id: number;
  work_id: number;
  version: number;
  created_at: string;
  is_active: boolean;
  items: EstimateItem[];
  total_budget: number;
}

export interface ActualExpense {
  id: number;
  work_id: number;
  estimate_item_id?: number;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
  date: string;
  source_entry_id?: number;
}

export interface PlanFactComparison {
  estimate_item_id: number;
  category: string;
  name: string;
  planned_quantity: number;
  actual_quantity: number;
  planned_cost: number;
  actual_cost: number;
  deviation_percent: number;
  deviation_amount: number;
  status: 'normal' | 'warning' | 'critical';
}