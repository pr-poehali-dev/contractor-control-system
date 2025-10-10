export interface WorkTemplate {
  id: number;
  title: string;
  code?: string;
  description?: string;
  normative_ref?: string;
  material_types?: string;
  created_at: string;
}

export interface WorkTemplateFormData {
  title: string;
  code: string;
  description: string;
  normative_ref: string;
  material_types: string;
}
