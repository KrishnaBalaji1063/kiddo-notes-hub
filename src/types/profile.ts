export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  nickname: string | null;
  user_type: 'parent' | 'child' | null;
  theme_preference: {
    color: string;
    font_size: string;
  } | null;
}