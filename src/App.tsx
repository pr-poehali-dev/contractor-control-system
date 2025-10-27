import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthRedux } from "./hooks/useAuthRedux";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeDefaultTemplates } from "./utils/initializeTemplates";
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
import TemplateEditor from "./pages/TemplateEditor";
import NewDocument from "./pages/NewDocument";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, token, verifyToken, loadUserData, userData } = useAuthRedux();
  const initRef = useRef(false);
  
  useEffect(() => {
    if (!initRef.current && token) {
      initRef.current = true;
      initializeDefaultTemplates();
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
  
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/objects" element={<ProtectedRoute><Objects /></ProtectedRoute>} />
              <Route path="/objects/create" element={<ProtectedRoute><CreateObject /></ProtectedRoute>} />
              <Route path="/objects/:objectId/edit" element={<ProtectedRoute><EditObject /></ProtectedRoute>} />
              <Route path="/objects/:objectId/public" element={<ProtectedRoute><ObjectPublicPage /></ProtectedRoute>} />
              <Route path="/objects/:objectId" element={<ProtectedRoute><ObjectDetail /></ProtectedRoute>} />
              <Route path="/objects/:objectId/works/create" element={<ProtectedRoute><CreateWork /></ProtectedRoute>} />
              <Route path="/objects/:objectId/works/:workId" element={<ProtectedRoute><WorkDetail /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
              <Route path="/my-works" element={<ProtectedRoute><MyWorks /></ProtectedRoute>} />
              <Route path="/work-log" element={<ProtectedRoute><WorkLog /></ProtectedRoute>} />
              <Route path="/inspection/:inspectionId" element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
              <Route path="/inspections/:inspectionId" element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
              <Route path="/journal-entry/:entryId" element={<ProtectedRoute><JournalEntryDetail /></ProtectedRoute>} />
              <Route path="/defect-report/:reportId" element={<ProtectedRoute><DefectReportDetail /></ProtectedRoute>} />
              <Route path="/defects" element={<ProtectedRoute><Defects /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/document/:id" element={<ProtectedRoute><DocumentView /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/public/objects/:objectId" element={<ProtectedRoute><PublicObject /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/work-templates" element={<ProtectedRoute><WorkTemplates /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/work-types" element={<ProtectedRoute><WorkTypes /></ProtectedRoute>} />
              <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
              <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path="/document-templates" element={<ProtectedRoute><DocumentTemplates /></ProtectedRoute>} />
              <Route path="/document-templates/:templateId" element={<ProtectedRoute><DocumentTemplateEditor /></ProtectedRoute>} />
              <Route path="/template/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
              <Route path="/document/new" element={<ProtectedRoute><NewDocument /></ProtectedRoute>} />
              <Route path="/organization" element={<ProtectedRoute><OrganizationPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;