import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Calendar as CalendarIcon, Loader2, Tag as TagIcon, Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const NoteCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams(); // For editing existing notes
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("main");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingData, setDrawingData] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch note",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setFolder(data.folder || 'main');
      setTags(data.tags || []);
      setImagePreview(data.image_url || '');
      setDrawingData(data.drawing_data || '');
      if (data.schedule_date) {
        setScheduleDate(new Date(data.schedule_date));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let imageUrl = imagePreview;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('notes-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('notes-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const noteData = {
        title,
        content,
        folder,
        tags,
        image_url: imageUrl || null,
        drawing_data: drawingData,
        schedule_date: scheduleDate?.toISOString() || null,
        is_scheduled: !!scheduleDate,
      };

      if (id) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert({
            ...noteData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: id ? "Note updated!" : "Note created!",
        description: `Your note has been ${id ? 'updated' : 'saved'} successfully! 🎉`,
      });

      navigate('/notes');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} note. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white p-4">
      <div className="container max-w-2xl mx-auto pt-8">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your note a title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Folder name (e.g., School, Personal)"
                />
              </div>

              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !scheduleDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm"
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-purple-400 hover:text-purple-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (press Enter)"
                />
              </div>

              <div className="space-y-2">
                <Label>Media Options</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image"
                  />
                  <Label
                    htmlFor="image"
                    className="flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Choose Image
                  </Label>
                  <Button
                    type="button"
                    onClick={() => setDrawingMode(!drawingMode)}
                    className="flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200"
                  >
                    <Pencil className="w-4 h-4" />
                    {drawingMode ? 'Hide Drawing' : 'Show Drawing'}
                  </Button>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              {drawingMode && (
                <div className="border rounded-lg p-4">
                  {/* Add your drawing component here */}
                  <div className="h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
                    Drawing canvas will be implemented here
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/notes')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    id ? "Update Note" : "Create Note"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteCreation;