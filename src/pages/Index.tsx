import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-purple-600 mb-6">
            KiddoNotes: Your Child's Digital Notebook
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A safe and fun space for children to express their thoughts, capture their ideas,
            and develop their writing skills.
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Get Started
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600">
                Private space for your child to write and express themselves.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                Kid-Friendly
              </h3>
              <p className="text-gray-600">
                Simple and intuitive interface designed specifically for children.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">
                Always Available
              </h3>
              <p className="text-gray-600">
                Access notes from anywhere, anytime, on any device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;