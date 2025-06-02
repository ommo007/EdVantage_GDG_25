import { supabase } from "../lib/supabaseClient";
export async function getStandards() {
  const { data, error } = await supabase.from("standards").select("*");
  if (error) throw error;
  return data;
}

export async function getDivisions(standardId) {
  const { data, error } = await supabase
    .from("divisions")
    .select("*")
    .eq("standard_id", standardId);
  if (error) throw error;
  return data;
}

export async function createDivision(standardId, division) {
  const { data, error } = await supabase
    .from("divisions")
    .insert([{ ...division, standard_id: standardId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDivision(divisionId, division) {
  const { data, error } = await supabase
    .from("divisions")
    .update(division)
    .eq("id", divisionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDivision(divisionId) {
  const { error } = await supabase
    .from("divisions")
    .delete()
    .eq("id", divisionId);
  if (error) throw error;
  return true;
}