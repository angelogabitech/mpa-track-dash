import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard.tsx";
import PavimentosPage from "./pages/PavimentosPage.tsx";
import PavimentoDetailPage from "./pages/PavimentoDetailPage.tsx";
import CaminhoesPage from "./pages/CaminhoesPage.tsx";
import FornecedoresPage from "./pages/FornecedoresPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import SetPasswordPage from "./pages/SetPasswordPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const AppRouter = typeof window !== "undefined" && window.location.protocol === "file:" ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/definir-senha" element={<SetPasswordPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/pavimentos" element={<PavimentosPage />} />
                        <Route path="/pavimentos/:id" element={<PavimentoDetailPage />} />
                        <Route path="/caminhoes" element={<CaminhoesPage />} />
                        <Route path="/fornecedores" element={<FornecedoresPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </AppRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
