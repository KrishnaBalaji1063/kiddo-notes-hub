import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  is_starred: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const TaskList = ({ tasks, onTaskUpdate }: TaskListProps) => {
  const { toast } = useToast();

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task deleted successfully",
    });

    onTaskUpdate();
  };

  const handleStarTask = async (taskId: string, currentStarred: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_starred: !currentStarred })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }

    onTaskUpdate();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStarTask(task.id, task.is_starred)}
                className="hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-4 h-4 ${
                    task.is_starred
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTask(task.id)}
                className="hover:scale-110 transition-transform"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
            {task.due_date && (
              <div className="mt-2 text-sm text-gray-500">
                Due: {format(new Date(task.due_date), "PPP")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;