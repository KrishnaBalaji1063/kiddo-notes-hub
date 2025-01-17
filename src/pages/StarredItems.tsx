import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star } from "lucide-react";
import { format } from "date-fns";

interface StarredItem {
  id: string;
  title: string;
  type: 'note' | 'task';
  due_date?: string | null;
  created_at: string;
}

const StarredItemsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [starredItems, setStarredItems] = useState<StarredItem[]>([]);

  useEffect(() => {
    const fetchStarredItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

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

      if (notesResponse.error) {
        toast({
          title: "Error",
          description: "Failed to fetch starred notes",
          variant: "destructive",
        });
        return;
      }

      if (tasksResponse.error) {
        toast({
          title: "Error",
          description: "Failed to fetch starred tasks",
          variant: "destructive",
        });
        return;
      }

      const notes = (notesResponse.data || []).map(note => ({
        ...note,
        type: 'note' as const
      }));

      const tasks = (tasksResponse.data || []).map(task => ({
        ...task,
        type: 'task' as const
      }));

      setStarredItems([...notes, ...tasks].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    };

    fetchStarredItems();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:scale-110 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              Starred Items
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {starredItems.length > 0 ? (
            starredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/${item.type}s`)}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {item.title}
                  </CardTitle>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-500 capitalize">Type: {item.type}</p>
                  {item.type === 'task' && item.due_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {format(new Date(item.due_date), "PPP")}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {format(new Date(item.created_at), "PPP")}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No starred items yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Star your favorite notes and tasks to see them here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarredItemsPage;