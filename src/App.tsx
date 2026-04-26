import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLayout from "./components/AppLayout";

// Lazy load page components for better code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profil = lazy(() => import("./pages/Profil"));
const MeinePunzen = lazy(() => import("./pages/MeinePunzen"));
const Recherche = lazy(() => import("./pages/Recherche"));
const AdminPunzen = lazy(() => import("./pages/AdminPunzen"));
const Kontakte = lazy(() => import("./pages/Kontakte"));
const Bilder = lazy(() => import("./pages/Bilder"));
const Export = lazy(() => import("./pages/Export"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminEinstellungen = lazy(() => import("./pages/AdminEinstellungen"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const Hilfe = lazy(() => import("./pages/Hilfe"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => <div className="flex items-center justify-center min-h-screen">Wird geladen...</div>;

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profil" element={<Profil />} />
                  <Route path="/punzen" element={<MeinePunzen />} />
                  <Route path="/recherche" element={<Recherche />} />
                  <Route path="/hilfe" element={<Hilfe />} />
                  <Route path="/admin/punzen" element={<AdminPunzen />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/einstellungen" element={<AdminEinstellungen />} />
                  <Route path="/admin/audit" element={<AdminAudit />} />
                  <Route path="/kontakte" element={<Kontakte />} />
                  <Route path="/bilder" element={<Bilder />} />
                  <Route path="/export" element={<Export />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
