export interface EstimateVersion {
  id: number;
  work_id: number;
  version: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
  is_active: boolean;
  xlsx_file_url?: string;
}

export interface EstimatePosition {
  id: number;
  version_id: number;
  name: string;
  unit: string;
  planned_quantity: number;
  base_unit_price?: number;
  current_unit_price?: number;
  base_cost?: number;
  current_cost?: number;
  coefficients?: string;
  position_number?: string;
}

export interface WorkReportPosition {
  id: number;
  report_id: number;
  estimate_position_id?: number;
  name: string;
  unit: string;
  actual_quantity: number;
  is_manual: boolean;
}

export interface WorkReport {
  id: number;
  work_id: number;
  version_id: number;
  created_at: string;
  created_by: number;
  created_by_name: string;
  description: string;
  photo_urls?: string[];
  positions: WorkReportPosition[];
}

export interface EstimateComparison {
  position_id: number;
  name: string;
  unit: string;
  planned_quantity: number;
  actual_quantity: number;
  percentage: number;
  status: 'under' | 'normal' | 'over';
  is_deleted?: boolean;
}
