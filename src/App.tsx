import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Graph from "./pages/graph";
import NotFound from "./pages/NotFound";
import Graph2568 from "./pages/graph2568";
import Emp from "./pages/Emp";
import Login from "./components/Login"; // Import your Login component
import DashboardEmp from "./pages/dashboardEmp";
import { AuthProvider } from "./pages/Auth";


const App = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("token") !== null;
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
  };
const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />

      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AuthProvider>
          <TooltipProvider>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/graph" element={<Graph />} />
                <Route path="/graph2568" element={<Graph2568 />} />
                <Route path="/emp" element={<Emp />} />
                <Route path="/dashboardEmp" element={<DashboardEmp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </AuthProvider>
      )}
    </QueryClientProvider>
  );
};

export default App;