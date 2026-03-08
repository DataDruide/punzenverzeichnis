import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Profil from "./pages/Profil";
import MeinePunzen from "./pages/MeinePunzen";
import Recherche from "./pages/Recherche";
import AdminPunzen from "./pages/AdminPunzen";
import Kontakte from "./pages/Kontakte";
import Bilder from "./pages/Bilder";
import Export from "./pages/Export";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AdminUsers from "./pages/AdminUsers";
import AdminEinstellungen from "./pages/AdminEinstellungen";
import Hilfe from "./pages/Hilfe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="/kontakte" element={<Kontakte />} />
              <Route path="/bilder" element={<Bilder />} />
              <Route path="/export" element={<Export />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
