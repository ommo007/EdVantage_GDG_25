import { supabase } from "../lib/supabaseClient";

export async function getStandardsSummary() {
  // Fetch all classes with their enrollments
  const { data, error } = await supabase
    .from('classes')
    .select('class_id, name, section, student_enrollments(student_user_id)');

  if (error) throw error;

  // Group by standard name
  const grouped = {};
  data.forEach(cls => {
    const std = cls.name;
    if (!grouped[std]) {
      grouped[std] = {
        id: std, // or use a hash or first class_id for navigation
        name: std,
        divisions: new Set(),
        students: new Set()
      };
    }
    grouped[std].divisions.add(cls.section);
    (cls.student_enrollments || []).forEach(enroll => grouped[std].students.add(enroll.student_user_id));
  });

  // Convert to array for UI
  return Object.values(grouped).map(s => ({
    id: s.id, // or use a generated id
    name: s.name,
    totalDivisions: s.divisions.size,
    totalStudents: s.students.size
  }));
}

export async function getDivisionsForStandard(standardName) {
  // Fetch all classes (divisions) for this standard
  const { data, error } = await supabase
    .from('classes')
    .select(`
      class_id,
      section,
      name,
      student_enrollments(student_user_id),
      class_subjects(subject_id, teacher_user_id)
    `)
    .eq('name', standardName);

  if (error) throw error;

  // Map to division objects
  return data.map(cls => ({
    id: cls.class_id,
    name: `Division ${cls.section}`,
    students: (cls.student_enrollments || []).length,
    teachers: new Set((cls.class_subjects || []).map(cs => cs.teacher_user_id)).size,
    courses: new Set((cls.class_subjects || []).map(cs => cs.subject_id)).size,
    status: "active" // You can add a status field in DB if needed
  }));
}

export async function addDivision(standardName, section) {
  const { data, error } = await supabase
    .from('classes')
    .insert([{ name: standardName, section }]);
  if (error) throw error;
  return data[0];
}

export async function deleteDivision(classId) {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('class_id', classId);
  if (error) throw error;
}

// services/admin_service.js
export async function editDivision(classId, updates) {
  const { data, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('class_id', classId)
    .select()
    .single();

  if (error) throw error;
  return data;
}