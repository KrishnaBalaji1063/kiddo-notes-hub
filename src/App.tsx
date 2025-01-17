import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import TaskCreation from "./pages/TaskCreation";
import NoteCreation from "./pages/NoteCreation";
import StarredItemsPage from "./pages/StarredItems";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteCreation />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskCreation />} />
          <Route path="/starred" element={<StarredItemsPage />} />
          <Route path="/" element={<Index />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;