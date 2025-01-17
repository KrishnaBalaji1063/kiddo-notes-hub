import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
}

interface TasksListProps {
  tasks: Task[] | undefined;
}

export const TasksList = ({ tasks }: TasksListProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm">Tasks To Do</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-800/50 transition-colors cursor-pointer"
                onClick={() => navigate('/tasks')}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                {task.due_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Due: {format(new Date(task.due_date), "PPP")}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tasks to do</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};