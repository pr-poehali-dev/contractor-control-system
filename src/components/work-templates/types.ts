export interface WorkTemplate {
  id: number;
  name: string;
  code?: string;
  description: string;
  category: string;
  unit: string;
  normative_base?: string;
  control_points?: string;
  typical_defects?: string;
  acceptance_criteria?: string;
  created_at: string;
  updated_at?: string;
}

export interface WorkTemplateFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  unit: string;
  normative_base: string;
  control_points: string;
  typical_defects: string;
  acceptance_criteria: string;
}

export const CATEGORIES = [
  'Общестроительные работы',
  'Кладочные работы',
  'Бетонные работы',
  'Арматурные работы',
  'Отделочные работы',
  'Плиточные работы',
  'Малярные работы',
  'Электромонтажные работы',
  'Сантехнические работы',
  'Кровельные работы',
  'Фасадные работы',
  'Благоустройство',
  'Прочие работы',
];

export const UNITS = ['м²', 'м³', 'м.п.', 'шт', 'комплект', 'т', 'кг', 'л'];
