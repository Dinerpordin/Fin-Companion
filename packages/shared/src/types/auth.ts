export interface UserProfile {
  id: string; // Corresponds to Supabase auth.users UUID
  phone_number: string;
  name?: string;
  created_at: string;
  updated_at: string;
}
