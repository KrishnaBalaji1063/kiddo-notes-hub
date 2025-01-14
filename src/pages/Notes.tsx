import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Smile, Star, PaintBucket, Camera, Image, Edit2, Save, Trash2 } from "lucide-react";

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
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

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

  useEffect(() => {
    if (canvasRef.current && isDrawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
      }
    }
  }, [isDrawing]);

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    setIsDrawingActive(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPoint({ x, y });
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive || !contextRef.current || !lastPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawingActive(false);
    setLastPoint(null);
    if (contextRef.current) {
      contextRef.current.closePath();
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

  // Memoize filtered notes for better performance
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-white shadow-md rounded-b-xl">
        <div className="container mx-auto px-4">
          <NavigationMenu>
            <NavigationMenuList className="flex justify-between items-center py-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-2xl font-bold text-purple-600 hover:text-purple-700 flex items-center gap-2"
                  href="/"
                >
                  <Smile className="w-8 h-8" />
                  <span className="font-comic">KiddoDoodle</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  className="rounded-full hover:bg-purple-100 transition-colors"
                >
                  Bye Bye! 👋
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-600 mb-8 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-400" />
            My Awesome Doodles!
          </h1>

          <Card className="p-6 mb-8 rounded-2xl border-2 border-purple-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <Input
                  placeholder="Give your doodle a fun name!"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="mb-2 rounded-xl text-lg placeholder:text-purple-300"
                />
                <Input
                  placeholder="Write your amazing thoughts here!"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="rounded-xl text-lg placeholder:text-purple-300"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full hover:bg-purple-100 transition-colors"
                >
                  <Image className="w-5 h-5 mr-2" />
                  Add a Picture!
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
                  className="rounded-full hover:bg-purple-100 transition-colors"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take a Photo!
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDrawing(!isDrawing)}
                  className="rounded-full hover:bg-purple-100 transition-colors"
                >
                  <PaintBucket className="w-5 h-5 mr-2" />
                  {isDrawing ? "Hide Drawing" : "Let's Draw!"}
                </Button>
              </div>

              {selectedImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="max-h-40 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {isDrawing && (
                <div className="border-2 border-purple-200 rounded-xl p-2">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="rounded-lg cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-lg"
              >
                {isLoading ? "Creating Magic..." : "Save My Doodle! ✨"}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <Card key={note.id} className="p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-colors">
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
                      className="rounded-xl"
                    />
                    <Input
                      value={note.content}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n =>
                          n.id === note.id ? { ...n, content: e.target.value } : n
                        );
                        setNotes(updatedNotes);
                      }}
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-purple-600 mb-2">{note.title}</h3>
                    <p className="text-gray-600">{note.content}</p>
                  </>
                )}
                
                {note.image_url && (
                  <img
                    src={note.image_url}
                    alt="Note"
                    className="mt-2 max-h-40 rounded-xl"
                  />
                )}
                
                {note.drawing_data && (
                  <img
                    src={note.drawing_data}
                    alt="Drawing"
                    className="mt-2 max-h-40 rounded-xl"
                  />
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-purple-400">
                    Created: {new Date(note.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                      className="rounded-full"
                    >
                      {editingNote === note.id ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Doodle
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="rounded-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
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
