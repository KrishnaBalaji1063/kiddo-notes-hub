import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Book, Calendar, ListTodo, Star, User } from "lucide-react";

interface Profile {
  full_name: string;
  nickname: string;
  user_type: "parent" | "child";
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, nickname, user_type")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: error.message,
        });
      }
    };

    getProfile();
  }, [navigate, toast]);

  const menuItems = [
    {
      title: "My Notes",
      icon: <Book className="w-8 h-8" />,
      description: "Write, draw, and create!",
      onClick: () => navigate("/notes"),
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Calendar",
      icon: <Calendar className="w-8 h-8" />,
      description: "Plan your activities",
      onClick: () => navigate("/calendar"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Tasks",
      icon: <ListTodo className="w-8 h-8" />,
      description: "Keep track of your to-dos",
      onClick: () => navigate("/tasks"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Recommendations",
      icon: <Star className="w-8 h-8" />,
      description: "Discover new activities",
      onClick: () => navigate("/recommendations"),
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">K.I.D.D.O</h1>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <User className="w-5 h-5" />
            <span>{profile?.nickname || "Profile"}</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">
              Welcome, {profile?.nickname || "Friend"}! 👋
            </h2>
            <p className="text-gray-600">What would you like to do today?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="p-6 cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={item.onClick}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;