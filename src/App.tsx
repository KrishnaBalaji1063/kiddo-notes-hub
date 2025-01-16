import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Notes from "./pages/Notes";
import ProfileCreation from "./pages/ProfileCreation";
import NoteCreation from "./pages/NoteCreation";
import TaskCreation from "./pages/TaskCreation";
import Tasks from "./pages/Tasks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProfileCreation />} />
            <Route path="/dashboard" element={<Navigate to="/notes" replace />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/new" element={<NoteCreation />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/new" element={<TaskCreation />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;