import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { UserProfile } from "./sidebar/UserProfile";
import { CalendarCard } from "./sidebar/CalendarCard";
import { TasksList } from "./sidebar/TasksList";
import { StarredItems } from "./StarredItems";
import { Profile } from "@/types/profile";

const NoteSidebar = ({ onDateSelect }: { onDateSelect: (date: Date | undefined) => void }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();

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

      const formattedProfile: Profile = {
        ...data,
        theme_preference: data.theme_preference ? {
          color: (data.theme_preference as any).color || 'purple',
          font_size: (data.theme_preference as any).font_size || 'medium'
        } : null
      };
      
      return formattedProfile;
    },
    retry: false,
    meta: {
      onError: () => {
        navigate('/auth');
      }
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
    enabled: !!profile
  });

  const { data: starredItems } = useQuery({
    queryKey: ['starred-items'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const [notesResponse, tasksResponse] = await Promise.all([
        supabase
          .from('notes')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .eq('is_starred', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('tasks')
          .select('id, title, created_at, due_date')
          .eq('user_id', user.id)
          .eq('is_starred', true)
          .order('created_at', { ascending: false })
      ]);

      const notes = (notesResponse.data || []).map(note => ({
        ...note,
        type: 'note' as const
      }));

      const tasks = (tasksResponse.data || []).map(task => ({
        ...task,
        type: 'task' as const
      }));

      return [...notes, ...tasks].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!profile
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/auth');
    }
  };

  if (profileError) return null;

  return (
    <div className="w-80 border-l bg-sidebar-background p-4 space-y-4">
      <UserProfile profile={profile} onLogout={handleLogout} />
      <CalendarCard onDateSelect={onDateSelect} />
      <StarredItems items={starredItems || []} />
      <TasksList tasks={tasks} />
    </div>
  );
};

export default NoteSidebar;
