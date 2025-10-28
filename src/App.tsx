import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthRedux } from "./hooks/useAuthRedux";
import { ROUTES, ROUTE_PATHS } from "./constants/routes";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Objects from "./pages/Objects";
import ObjectDetail from "./pages/ObjectDetail";
import WorkDetail from "./pages/WorkDetail";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import MyWorks from "./pages/MyWorks";
import WorkLog from "./pages/WorkLog";
import Defects from "./pages/Defects";
import Analytics from "./pages/Analytics";
import Contractors from "./pages/Contractors";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import PublicObject from "./pages/PublicObject";
import ObjectPublicPage from "./pages/ObjectPublicPage";
import JournalEntryDetail from "./pages/JournalEntryDetail";
import InspectionDetail from "./pages/InspectionDetail";
import DefectReportDetail from "./pages/DefectReportDetail";
import CreateObject from "./pages/CreateObject";
import EditObject from "./pages/EditObject";
import CreateWork from "./pages/CreateWork";
import WorkTemplates from "./pages/WorkTemplates";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import WorkTypes from "./pages/WorkTypes";
import Documents from "./pages/Documents";
import MyTasks from "./pages/MyTasks";
import NotFound from "./pages/NotFound";
import DocumentTemplates from "./pages/DocumentTemplates";
import DocumentTemplateEditor from "./pages/DocumentTemplateEditor";
import DocumentView from "./pages/DocumentView";
import OrganizationPage from "./pages/OrganizationPage";
import NewDocument from "./pages/NewDocument";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, token, verifyToken, loadUserData, userData } = useAuthRedux();
  const initRef = useRef(false);
  
  useEffect(() => {
    if (!initRef.current && token) {
      initRef.current = true;
      verifyToken().then((result: any) => {
        if (result.payload === true || result.meta?.requestStatus === 'fulfilled') {
          loadUserData();
        }
      });
    }
  }, [token, verifyToken, loadUserData]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to={ROUTES.LOGIN} />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} />} />
              <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path={ROUTES.OBJECTS} element={<ProtectedRoute><Objects /></ProtectedRoute>} />
              <Route path={ROUTES.OBJECTS_CREATE} element={<ProtectedRoute><CreateObject /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.OBJECT_EDIT} element={<ProtectedRoute><EditObject /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.OBJECT_PUBLIC} element={<ProtectedRoute><ObjectPublicPage /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.OBJECT_DETAIL} element={<ProtectedRoute><ObjectDetail /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.WORK_CREATE} element={<ProtectedRoute><CreateWork /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.WORK_DETAIL} element={<ProtectedRoute><WorkDetail /></ProtectedRoute>} />
              <Route path={ROUTES.ACTIVITY} element={<ProtectedRoute><Activity /></ProtectedRoute>} />
              <Route path={ROUTES.MY_WORKS} element={<ProtectedRoute><MyWorks /></ProtectedRoute>} />
              <Route path={ROUTES.WORK_LOG} element={<ProtectedRoute><WorkLog /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.INSPECTION_DETAIL} element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.INSPECTION_DETAIL_ALT} element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.JOURNAL_ENTRY} element={<ProtectedRoute><JournalEntryDetail /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.DEFECT_REPORT} element={<ProtectedRoute><DefectReportDetail /></ProtectedRoute>} />
              <Route path={ROUTES.DEFECTS} element={<ProtectedRoute><Defects /></ProtectedRoute>} />
              <Route path={ROUTES.DOCUMENTS} element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.DOCUMENT_VIEW} element={<ProtectedRoute><DocumentView /></ProtectedRoute>} />
              <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path={ROUTES.CONTRACTORS} element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
              <Route path={ROUTES.MESSAGES} element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.PUBLIC_OBJECT} element={<ProtectedRoute><PublicObject /></ProtectedRoute>} />
              <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path={ROUTES.WORK_TEMPLATES} element={<ProtectedRoute><WorkTemplates /></ProtectedRoute>} />
              <Route path={ROUTES.ADMIN} element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path={ROUTES.WORK_TYPES} element={<ProtectedRoute><WorkTypes /></ProtectedRoute>} />
              <Route path={ROUTES.MY_TASKS} element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
              <Route path={ROUTES.PRICING} element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path={ROUTES.DOCUMENT_TEMPLATES} element={<ProtectedRoute><DocumentTemplates /></ProtectedRoute>} />
              <Route path={ROUTE_PATHS.DOCUMENT_TEMPLATE_EDITOR} element={<ProtectedRoute><DocumentTemplateEditor /></ProtectedRoute>} />
              <Route path={ROUTES.DOCUMENT_NEW} element={<ProtectedRoute><NewDocument /></ProtectedRoute>} />
              <Route path={ROUTES.ORGANIZATION} element={<ProtectedRoute><OrganizationPage /></ProtectedRoute>} />
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;