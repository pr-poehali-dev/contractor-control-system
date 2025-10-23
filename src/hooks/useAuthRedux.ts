import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  login as loginAction,
  loginWithPhone as loginWithPhoneAction,
  register as registerAction,
  logout as logoutAction,
  verifyToken as verifyTokenAction,
  loadUserData as loadUserDataAction,
} from '@/store/slices/userSlice';
import { useMemo } from 'react';

export const useAuthRedux = () => {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state) => state.user.user);
  const token = useAppSelector((state) => state.user.token);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const error = useAppSelector((state) => state.user.error);

  const objects = useAppSelector((state) => state.objects.objects);
  const works = useAppSelector((state) => state.works.works);
  const inspections = useAppSelector((state) => state.inspections.inspections);
  const workLogs = useAppSelector((state) => state.workLogs.workLogs);
  const contractors = useAppSelector((state) => state.contractors.contractors);
  const chatMessages = useAppSelector((state) => state.chatMessages.chatMessages);
  const defectReports = useAppSelector((state) => state.defectReports.defectReports);

  const userData = useMemo(
    () => ({
      objects,
      works,
      inspections,
      remarks: [],
      workLogs,
      checkpoints: [],
      contractors,
      chatMessages,
      defect_reports: defectReports,
    }),
    [objects, works, inspections, workLogs, contractors, chatMessages, defectReports]
  );

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAction({ email, password }));
    if (loginAction.fulfilled.match(result)) {
      await dispatch(loadUserDataAction());
    }
    return result;
  };

  const loginWithPhone = async (phone: string, code: string) => {
    const result = await dispatch(loginWithPhoneAction({ phone, code }));
    if (loginWithPhoneAction.fulfilled.match(result)) {
      await dispatch(loadUserDataAction());
    }
    return result;
  };

  const register = async (data: {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    role?: 'client' | 'contractor';
    organization?: string;
  }) => {
    const result = await dispatch(registerAction(data));
    if (registerAction.fulfilled.match(result)) {
      await dispatch(loadUserDataAction());
    }
    return result;
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const verifyToken = async () => {
    return dispatch(verifyTokenAction());
  };

  const loadUserData = async () => {
    return dispatch(loadUserDataAction());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    userData,
    login,
    loginWithPhone,
    register,
    logout,
    verifyToken,
    loadUserData,
  };
};