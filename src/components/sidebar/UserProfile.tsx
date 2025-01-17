import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import { Profile } from "@/types/profile";

interface UserProfileProps {
  profile: Profile | undefined;
  onLogout: () => void;
}

export const UserProfile = ({ profile, onLogout }: UserProfileProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Avatar className="cursor-pointer" onClick={() => navigate('/profile')}>
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{profile?.full_name}</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};