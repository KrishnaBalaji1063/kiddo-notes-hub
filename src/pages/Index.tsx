import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Smile, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/notes");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-purple-600 mb-4">
            K.I.D.D.O
          </h1>
          <h2 className="text-3xl text-purple-500 mb-6">
            Your Digital Notebook
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A magical space where your thoughts come to life! 🌟
          </p>

          {/* Main CTA Button */}
          <div className="mb-12">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-purple-600 hover:bg-purple-700 text-xl px-8 py-6 h-auto"
              size="lg"
            >
              Get Started
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Heart className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                I Love You
              </h3>
              <p className="text-gray-600">
                Express yourself freely in your own special way
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Smile className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                Friendly
              </h3>
              <p className="text-gray-600">
                Easy and fun to use for everyone
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Clock className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                Available
              </h3>
              <p className="text-gray-600">
                Access your notes anytime, anywhere
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-16 bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold text-purple-600 mb-4">
              About K.I.D.D.O
            </h3>
            <p className="text-gray-600">
              K.I.D.D.O is your personal digital notebook designed to make writing, drawing, 
              and organizing your thoughts fun and easy. Whether you're writing stories, 
              keeping a diary, or working on homework, K.I.D.D.O is here to help you create 
              and grow! 🌈✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;