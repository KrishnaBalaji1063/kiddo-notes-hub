import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, CalendarDays, CheckSquare, Edit3, Folder, Plus, Search, Star, Tag, Trash2 } from "lucide-react";
import NoteSidebar from "@/components/NoteSidebar";
import CalendarModal from "@/components/CalendarModal";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [starredNotes, setStarredNotes] = useState<Set<string>>(new Set());
  const [showingStarred, setShowingStarred] = useState(false);

  const menuItems = [
    {
      icon: <CalendarDays className="w-6 h-6" />,
      color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300",
      iconBg: "bg-purple-50 dark:bg-purple-800/50",
      onClick: () => setIsCalendarOpen(true),
      showTitle: false,
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300",
      iconBg: "bg-blue-50 dark:bg-blue-800/50",
      onClick: () => navigate('/tasks'),
      showTitle: false,
    },
    {
      icon: <Star className="w-6 h-6" />,
      color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300",
      iconBg: "bg-yellow-50 dark:bg-yellow-800/50",
      onClick: () => {
        setShowingStarred(!showingStarred);
        if (!showingStarred) {
          const starredNotesList = notes.filter(note => starredNotes.has(note.id));
          if (starredNotesList.length > 0) {
            setNotes(starredNotesList);
            toast({
              title: "Showing starred notes",
              description: `Found ${starredNotesList.length} starred notes`,
            });
          } else {
            toast({
              title: "No starred notes",
              description: "Star some notes to see them here!",
            });
          }
        } else {
          fetchNotes();
        }
      },
      showTitle: false,
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

  const toggleStarred = (noteId: string) => {
    const newStarredNotes = new Set(starredNotes);
    if (newStarredNotes.has(noteId)) {
      newStarredNotes.delete(noteId);
    } else {
      newStarredNotes.add(noteId);
    }
    setStarredNotes(newStarredNotes);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = !selectedFolder || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex h-screen bg-gradient-to-b from-purple-50/50 via-pink-50/50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full hover:scale-105 transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer transform hover:scale-105 transition-transform hover:shadow-xl bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
              onClick={item.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-center p-4">
                <div className={`${item.iconBg} p-3 rounded-xl`}>
                  <div className={`${item.color} p-2 rounded-lg`}>
                    {item.icon}
                  </div>
                </div>
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
              className="pl-10 hover:shadow-md transition-shadow bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "default" : "outline"}
                onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                className="gap-2 hover:scale-105 transition-transform whitespace-nowrap bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
              >
                <Folder className="w-4 h-4" />
                {folder}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer transform hover:scale-105 transition-transform hover:shadow-xl bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
            >
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {note.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStarred(note.id)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        starredNotes.has(note.id)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
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
              <CardContent className="p-4 pt-0">
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
      <NoteSidebar onDateSelect={setSelectedDate} />
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={setSelectedDate}
      />
    </div>
  );
};

export default Notes;
