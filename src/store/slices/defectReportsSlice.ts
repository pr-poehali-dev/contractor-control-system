import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DefectReport {
  id: number;
  report_number: string;
  work_id: number;
  object_id: number;
  status: 'active' | 'resolved' | 'closed';
  total_defects?: number;
  critical_defects?: number;
  created_at: string;
  created_by: number;
  report_data?: {
    defects?: any[];
  };
  remediations?: any[];
}

interface DefectReportsState {
  items: DefectReport[];
  loading: boolean;
  error: string | null;
}

const initialState: DefectReportsState = {
  items: [],
  loading: false,
  error: null,
};

const defectReportsSlice = createSlice({
  name: 'defectReports',
  initialState,
  reducers: {
    setDefectReports(state, action: PayloadAction<DefectReport[]>) {
      state.items = action.payload;
    },
    clearDefectReportsError(state) {
      state.error = null;
    },
  },
});

export const { setDefectReports, clearDefectReportsError } = defectReportsSlice.actions;
export default defectReportsSlice.reducer;
