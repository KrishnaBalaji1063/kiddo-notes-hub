import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "./ThemeToggle";
import { format } from "date-fns";
import { useEffect } from "react";

const NoteSidebar = ({ onDateSelect }: { onDateSelect: (date: Date | undefined) => void }) => {
  const navigate = useNavigate();

  // Check auth state on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: profile, isError: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    retry: false,
    onError: () => {
      navigate('/auth');
    }
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile // Only fetch tasks if profile exists
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigation to auth page even if signOut fails
      navigate('/auth');
    }
  };

  // If there's a profile error, don't render the sidebar
  if (profileError) return null;

  return (
    <div className="w-80 border-l bg-sidebar-background p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Avatar className="cursor-pointer" onClick={() => navigate('/profile')}>
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{profile?.full_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            onSelect={onDateSelect}
            className="rounded-md border-none bg-transparent"
            classNames={{
              months: "space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-purple-600 dark:text-purple-300",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-full transition-all",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-purple-600/60 dark:text-purple-300/60 rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-purple-100 dark:bg-purple-800/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-full transition-all",
              day_today: "bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100",
              day_outside: "text-purple-600/50 dark:text-purple-300/50 opacity-50 aria-selected:bg-purple-100/50 dark:aria-selected:bg-purple-800/50",
              day_disabled: "text-purple-600/50 dark:text-purple-300/50 opacity-50",
              day_range_middle: "aria-selected:bg-purple-100 dark:aria-selected:bg-purple-800 aria-selected:text-purple-900 dark:aria-selected:text-purple-100",
              day_hidden: "invisible",
              day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-700 focus:text-white dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600",
            }}
          />
        </CardContent>
      </Card>

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
    </div>
  );
};

export default NoteSidebar;