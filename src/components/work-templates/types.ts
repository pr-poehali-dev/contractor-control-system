export interface ControlPoint {
  id: string;
  description: string;
  standard: string;
  standard_clause: string;
  is_critical: boolean;
}

export interface WorkTemplate {
  id: number;
  title: string;
  code?: string;
  description?: string;
  normative_ref?: string;
  material_types?: string;
  category?: string;
  control_points?: ControlPoint[];
  created_at: string;
}

export interface WorkTemplateFormData {
  title: string;
  code: string;
  description: string;
  normative_ref: string;
  material_types: string;
  category: string;
  control_points: ControlPoint[];
}