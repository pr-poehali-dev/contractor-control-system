export interface WorkForm {
  id: string;
  workId?: number;
  category: string;
  title: string;
  volume: string;
  unit: string;
  planned_start_date: string;
  planned_end_date: string;
  contractor_id: string;
  isExisting: boolean;
}

export const emptyWork: WorkForm = {
  id: '',
  category: '',
  title: '',
  volume: '',
  unit: 'м²',
  planned_start_date: '',
  planned_end_date: '',
  contractor_id: '',
  isExisting: false,
};

export const UNITS = [
  'м²',
  'м³',
  'м',
  'пог.м',
  'шт',
  'кг',
  'т',
  'л',
  'компл.',
];