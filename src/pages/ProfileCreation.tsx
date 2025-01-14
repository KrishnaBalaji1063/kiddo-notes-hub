import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, User } from "lucide-react";

const ProfileCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [isParent, setIsParent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          nickname,
          user_type: isParent ? "parent" : "child",
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile created! 🎉",
        description: "Welcome to K.I.D.D.O!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating profile",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 py-16">
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Create Your Profile</h1>
            <p className="text-gray-600">Let's make your K.I.D.D.O space special! ✨</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <Button variant="outline" className="text-sm">
                Choose Profile Photo
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="What should we call you?"
                  className="mt-1"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="user-type">I am a Parent</Label>
                <Switch
                  id="user-type"
                  checked={isParent}
                  onCheckedChange={setIsParent}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating Profile..." : "Let's Begin! 🚀"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreation;