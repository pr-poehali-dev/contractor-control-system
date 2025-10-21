import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import objectsReducer from './slices/objectsSlice';
import worksReducer from './slices/worksSlice';
import workLogsReducer from './slices/workLogsSlice';
import inspectionsReducer from './slices/inspectionsSlice';
import contractorsReducer from './slices/contractorsSlice';
import defectReportsReducer from './slices/defectReportsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    objects: objectsReducer,
    works: worksReducer,
    workLogs: workLogsReducer,
    inspections: inspectionsReducer,
    contractors: contractorsReducer,
    defectReports: defectReportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['user/login/fulfilled', 'user/loadUserData/fulfilled'],
        ignoredPaths: ['user.userData'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;