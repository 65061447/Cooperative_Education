import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom"; // Changed to HashRouter
import Index from "./pages/Index";
import Graph from "./pages/graph";
import NotFound from "./pages/NotFound";
import Graph2568 from "./pages/graph2568";
import Emp from "./pages/Emp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Using HashRouter prevents 404 errors on refresh in GitHub Pages.
          Basename is usually not needed with HashRouter on GH Pages.
      */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/graph2568" element={<Graph2568/>} />
          <Route path="/emp" element={<Emp/>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;