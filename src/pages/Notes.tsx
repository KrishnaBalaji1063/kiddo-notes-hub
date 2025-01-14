import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit3, Folder, Plus, Search, Tag } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  folder: string;
  image_url: string | null;
}

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch notes",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setNotes(data);
        const uniqueFolders = Array.from(new Set(data.map(note => note.folder)));
        setFolders(uniqueFolders);
      }
    };

    fetchNotes();
  }, [navigate, toast]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !selectedFolder || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-purple-600">My Notes 📝</h1>
          <Button
            onClick={() => navigate('/notes/new')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "default" : "outline"}
                onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                className="gap-2"
              >
                <Folder className="w-4 h-4" />
                {folder}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {note.title}
                </CardTitle>
                <Edit3 className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{note.content}</p>
                {note.image_url && (
                  <img
                    src={note.image_url}
                    alt="Note"
                    className="mt-2 rounded-lg w-full h-32 object-cover"
                  />
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {note.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;