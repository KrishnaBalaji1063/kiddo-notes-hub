import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft } from "lucide-react";
import TaskList from "@/components/TaskList";

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notes')}
              className="hover:scale-110 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Tasks 📋
            </h1>
          </div>
          <Button
            onClick={() => navigate('/tasks/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full hover:scale-105 transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>

        <TaskList
          tasks={tasks}
          onTaskUpdate={fetchTasks}
        />
      </div>
    </div>
  );
};

export default Tasks;