import { supabase } from "../lib/supabaseClient";

// Get announcements for a specific class
export async function getAnnouncements(classId) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("target_class_id", classId)  // ✅ Correct column
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Create a new announcement for a class


export async function createAnnouncement(classId, announcement) {
  // Fetch currently logged in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated", userError);
    throw new Error("You must be logged in to create an announcement.");
  }

  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        ...announcement,
        target_class_id: classId,
        created_by_user_id: user.id,      // ✅ Set required field
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error inserting announcement:", error);
    throw error;
  }

  return data;
}
