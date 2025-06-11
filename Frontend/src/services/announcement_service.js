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
  // For demo purposes, use a hardcoded teacher ID
  const demoTeacherId = "9bd315e0-11e5-496a-a354-33dce517ef1a";

  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        ...announcement,
        target_class_id: classId,
        created_by_user_id: demoTeacherId,      // ✅ Use demo teacher ID
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
