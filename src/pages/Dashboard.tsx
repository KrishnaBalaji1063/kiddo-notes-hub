import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Book, Calendar, CheckSquare, Plus, Star } from "lucide-react";

interface Profile {
  full_name: string;
  nickname: string;
  avatar_url: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, nickname, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    getProfile();
  }, [navigate]);

  const menuItems = [
    {
      title: "Notes",
      icon: <Book className="w-6 h-6" />,
      color: "bg-pink-100",
      textColor: "text-pink-600",
      onClick: () => navigate('/notes'),
    },
    {
      title: "Calendar",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      onClick: () => navigate('/calendar'),
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
      onClick: () => navigate('/recommendations'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-purple-600">
                Welcome, {profile?.nickname || "Friend"}! 👋
              </h1>
              <p className="text-gray-600">What would you like to do today?</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/notes/new')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer transform hover:scale-105 transition-transform"
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
              <CardContent>
                <p className="text-gray-600">
                  {item.title === "Notes" && "Write and draw your thoughts!"}
                  {item.title === "Calendar" && "Keep track of important dates!"}
                  {item.title === "Tasks" && "Complete your daily missions!"}
                  {item.title === "Recommendations" && "Discover new activities!"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;