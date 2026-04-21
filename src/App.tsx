import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminContentList from "./pages/admin/AdminContentList.tsx";
import AdminContentEdit from "./pages/admin/AdminContentEdit.tsx";
import AdminEpisodes from "./pages/admin/AdminEpisodes.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/anime" element={<Index category="anime" />} />
            <Route path="/drama" element={<Index category="drama" />} />
            <Route path="/kino" element={<Index category="kino" />} />
            <Route path="/multfilm" element={<Index category="multfilm" />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="content" element={<AdminContentList />} />
              <Route path="content/new" element={<AdminContentEdit />} />
              <Route path="content/:id" element={<AdminContentEdit />} />
              <Route path="content/:id/episodes" element={<AdminEpisodes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
