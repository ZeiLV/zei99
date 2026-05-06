import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminContentList from "./pages/admin/AdminContentList.tsx";
import AdminContentEdit from "./pages/admin/AdminContentEdit.tsx";
import AdminEpisodes from "./pages/admin/AdminEpisodes.tsx";
import AdminVip from "./pages/admin/AdminVip.tsx";
import AdminVoting from "./pages/admin/AdminVoting.tsx";
import Voting from "./pages/Voting.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/anime" element={<AuthGuard><Index category="anime" /></AuthGuard>} />
              <Route path="/drama" element={<AuthGuard><Index category="drama" /></AuthGuard>} />
              <Route path="/kino" element={<AuthGuard><Index category="kino" /></AuthGuard>} />
              <Route path="/multfilm" element={<AuthGuard><Index category="multfilm" /></AuthGuard>} />
              <Route path="/voting" element={<AuthGuard><Voting /></AuthGuard>} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="content" element={<AdminContentList />} />
                <Route path="content/new" element={<AdminContentEdit />} />
                <Route path="content/:id" element={<AdminContentEdit />} />
                <Route path="content/:id/episodes" element={<AdminEpisodes />} />
                <Route path="vip" element={<AdminVip />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
