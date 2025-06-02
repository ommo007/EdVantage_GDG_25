import { supabase } from "../lib/supabaseClient";

// Get current user's role (via role_id from user_profiles)
export async function getUserRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role_id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data.role_id; // You can join with 'roles' table if you want the role name
}

// Log out user and clear localStorage
export async function logout() {
  await supabase.auth.signOut();
  localStorage.clear();
}

// Get complete user profile from user_profiles
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
