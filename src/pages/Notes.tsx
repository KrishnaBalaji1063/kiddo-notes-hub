import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Book, Calendar, CheckSquare, Edit3, Folder, Plus, Search, Star, Tag, Trash2 } from "lucide-react";
import NoteSidebar from "@/components/NoteSidebar";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  folder: string;
  image_url: string | null;
  schedule_date: string | null;
}

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [folders, setFolders] = useState<string[]>([]);

  const menuItems = [
    {
      title: "Calendar",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      onClick: () => setSelectedDate(new Date()),
    },
    {
      title: "Tasks",
      icon: <CheckSquare className="w-6 h-6" />,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      onClick: () => navigate('/tasks'),
    },
    {
      title: "Recommendations",
      icon: <Star className="w-6 h-6" />,
      color: "bg-yellow-100",
      textColor: "text-yellow-600",
      onClick: () => toast({
        title: "Coming Soon",
        description: "This feature will be available soon!",
      }),
    },
  ];

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query;

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

  useEffect(() => {
    fetchNotes();
  }, [navigate, toast, selectedDate]);

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Note deleted successfully",
    });

    fetchNotes();
  };

  const handleEditNote = (noteId: string) => {
    navigate(`/notes/edit/${noteId}`);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !selectedFolder || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="hover:scale-110 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Notes 📝
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.forward()}
                className="hover:scale-110 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => navigate('/notes/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="cursor-pointer transform hover:scale-105 transition-transform hover:shadow-xl"
                onClick={item.onClick}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`${item.color} p-3 rounded-lg`}>
                    {item.icon}
                  </div>
                  <CardTitle className={`${item.textColor}`}>
                    {item.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 hover:shadow-md transition-shadow"
              />
            </div>
            <div className="flex gap-2">
              {folders.map((folder) => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder ? "default" : "outline"}
                  onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                  className="gap-2 hover:scale-105 transition-transform"
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
                className="cursor-pointer transform hover:scale-105 transition-transform hover:shadow-xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {note.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditNote(note.id)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{note.content}</p>
                  {note.image_url && (
                    <img
                      src={note.image_url}
                      alt="Note"
                      className="mt-2 rounded-lg w-full h-32 object-cover hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags?.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full hover:scale-105 transition-transform"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                  {note.schedule_date && (
                    <div className="mt-2 text-sm text-gray-500">
                      Scheduled: {new Date(note.schedule_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <NoteSidebar onDateSelect={setSelectedDate} />
    </div>
  );
};

export default Notes;
