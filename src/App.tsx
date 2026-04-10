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

const queryClient = new QueryClient();

const App = () => {
  // Check if user is already logged in (persists through refresh)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("sso_auth") === "true";
  });

  const handleLoginSuccess = () => {
    localStorage.setItem("sso_auth", "true");
    setIsAuthenticated(true);
  };

  // --- SAFE GUARD ---
  // If not logged in, we return ONLY the Login UI. 
  // The Router and Emp page are never even initialized.
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <Login onLoginSuccess={handleLoginSuccess} />
      </QueryClientProvider>
    );
  }

  // --- AUTHENTICATED CONTENT ---
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/graph2568" element={<Graph2568 />} />
            <Route path="/emp" element={<Emp />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/dashboardEmp" element={<DashboardEmp/>} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;