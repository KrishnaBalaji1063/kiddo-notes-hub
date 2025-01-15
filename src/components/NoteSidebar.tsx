import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "./ThemeToggle";

const NoteSidebar = ({ onDateSelect }: { onDateSelect: (date: Date | undefined) => void }) => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
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
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            onSelect={onDateSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* We'll implement tasks in the next iteration */}
            <p className="text-sm text-muted-foreground">No upcoming tasks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteSidebar;