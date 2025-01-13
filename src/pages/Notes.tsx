import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      // Check if profile exists, if not create it
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }]);
          
        if (profileError) {
          toast({
            variant: "destructive",
            title: "Error creating profile",
            description: profileError.message,
          });
          return;
        }
      }
      
      setUser(user);
      fetchNotes(user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchNotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq('user_id', userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching notes",
          description: error.message,
        });
        return;
      }
      setNotes(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching notes",
        description: "Failed to fetch notes. Please try again.",
      });
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both title and content",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("notes").insert([
        {
          title: newNote.title,
          content: newNote.content,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewNote({ title: "", content: "" });
      toast({
        title: "Success!",
        description: "Note added successfully",
      });
      fetchNotes(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding note",
        description: error.message || "Failed to add note",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <NavigationMenu>
            <NavigationMenuList className="flex justify-between items-center py-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-lg font-bold text-purple-600 hover:text-purple-700"
                  href="/"
                >
                  KiddoNotes
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-purple-600 mb-8">My Notes</h1>

          <Card className="p-6 mb-8">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <Input
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Note Content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding Note..." : "Add Note"}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                <p className="text-gray-600">{note.content}</p>
                <div className="text-sm text-gray-400 mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;