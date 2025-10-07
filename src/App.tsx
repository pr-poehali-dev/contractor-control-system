
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ObjectDetail from "./pages/ObjectDetail";
import WorkDetail from "./pages/WorkDetail";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import MyWorks from "./pages/MyWorks";
import WorkLog from "./pages/WorkLog";
import CreateInspection from "./pages/CreateInspection";
import Defects from "./pages/Defects";
import Analytics from "./pages/Analytics";
import Contractors from "./pages/Contractors";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import JournalEntryDetail from "./pages/JournalEntryDetail";
import InspectionDetail from "./pages/InspectionDetail";
import CreateProject from "./pages/CreateProject";
import CreateObject from "./pages/CreateObject";
import CreateWork from "./pages/CreateWork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/projects/:projectId/objects/create" element={<ProtectedRoute><CreateObject /></ProtectedRoute>} />
            <Route path="/projects/:projectId/objects/:objectId" element={<ProtectedRoute><ObjectDetail /></ProtectedRoute>} />
            <Route path="/projects/:projectId/objects/:objectId/works/create" element={<ProtectedRoute><CreateWork /></ProtectedRoute>} />
            <Route path="/projects/:projectId/objects/:objectId/works/:workId" element={<ProtectedRoute><WorkDetail /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/my-works" element={<ProtectedRoute><MyWorks /></ProtectedRoute>} />
            <Route path="/work-log" element={<ProtectedRoute><WorkLog /></ProtectedRoute>} />
            <Route path="/create-inspection" element={<ProtectedRoute><CreateInspection /></ProtectedRoute>} />
            <Route path="/inspection/:inspectionId" element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
            <Route path="/journal-entry/:entryId" element={<ProtectedRoute><JournalEntryDetail /></ProtectedRoute>} />
            <Route path="/defects" element={<ProtectedRoute><Defects /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;