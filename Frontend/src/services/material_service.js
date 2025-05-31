import { supabase } from "../lib/supabaseClient";

// 4. Subject & Material Service

export async function getSubjectsForClass(classId) {
  const { data, error } = await supabase
    .from("class_subjects")
    .select("subject_id, subjects(name)")
    .eq("class_id", classId);

  if (error) throw error;
  return data.map(item => item.subjects); // Return subject details
}

//will be done using app/write
export async function uploadMaterial(classId, subject, file) {
  // Upload file to Supabase Storage
  const filePath = `${classId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("materials")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  // Insert metadata in 'materials' table
  const { data, error } = await supabase
    .from("materials")
    .insert([{ class_id: classId, subject, file_path: filePath, file_name: file.name }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(materialId) {
  // Get file path first
  const { data, error: fetchError } = await supabase
    .from("materials")
    .select("file_path")
    .eq("id", materialId)
    .single();
  if (fetchError) throw fetchError;

  // Remove from storage
  await supabase.storage.from("materials").remove([data.file_path]);

  // Remove from table
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", materialId);
  if (error) throw error;
  return true;
}

export async function getMaterialsForClass(classId, subject) {
  const query = supabase
    .from("materials")
    .select("*")
    .eq("class_id", classId);
  if (subject) query.eq("subject", subject);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}