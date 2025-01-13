import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Camera, Image, Edit2, Save, X } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
  drawing_data?: string;
}

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
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

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching notes",
        description: error.message,
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
      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('notes-images')
          .upload(filePath, selectedImage);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('notes-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      let drawingData = null;
      if (canvasRef.current) {
        drawingData = canvasRef.current.toDataURL();
      }

      const { error } = await supabase.from("notes").insert([
        {
          title: newNote.title,
          content: newNote.content,
          user_id: user.id,
          image_url: imageUrl,
          drawing_data: drawingData,
        },
      ]);

      if (error) throw error;

      setNewNote({ title: "", content: "" });
      setSelectedImage(null);
      setIsDrawing(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      toast({
        title: "Success!",
        description: "Note added successfully",
      });
      fetchNotes(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding note",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = async (note: Note) => {
    if (editingNote === note.id) {
      try {
        const { error } = await supabase
          .from("notes")
          .update({
            title: note.title,
            content: note.content,
          })
          .eq('id', note.id);

        if (error) throw error;

        setEditingNote(null);
        fetchNotes(user.id);
        toast({
          title: "Success!",
          description: "Note updated successfully",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error updating note",
          description: error.message,
        });
      }
    } else {
      setEditingNote(note.id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: error.message,
      });
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
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraCapture}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDrawing(!isDrawing)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isDrawing ? "Hide Drawing" : "Draw"}
                </Button>
              </div>

              {selectedImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="max-h-40 rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {isDrawing && (
                <div className="border rounded p-2">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="border rounded cursor-crosshair"
                  />
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding Note..." : "Add Note"}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                {editingNote === note.id ? (
                  <div className="space-y-2">
                    <Input
                      value={note.title}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n =>
                          n.id === note.id ? { ...n, title: e.target.value } : n
                        );
                        setNotes(updatedNotes);
                      }}
                    />
                    <Input
                      value={note.content}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n =>
                          n.id === note.id ? { ...n, content: e.target.value } : n
                        );
                        setNotes(updatedNotes);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
                    <p className="text-gray-600">{note.content}</p>
                  </>
                )}
                
                {note.image_url && (
                  <img
                    src={note.image_url}
                    alt="Note"
                    className="mt-2 max-h-40 rounded"
                  />
                )}
                
                {note.drawing_data && (
                  <img
                    src={note.drawing_data}
                    alt="Drawing"
                    className="mt-2 max-h-40 rounded"
                  />
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNote(note)}
                  >
                    {editingNote === note.id ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
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