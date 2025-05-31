import { supabase } from "../lib/supabaseClient";
// Instead of fetching students directly from students table...
export async function getStudentsByClassId(classId) {
  const { data, error } = await supabase
    .from('student_enrollments') // junction table
    .select('student_user_id, students(*)') // join with student info
    .eq('class_id', classId);

  if (error) throw error;

  // Return full student profiles
  return data.map(entry => entry.students);
}

export async function addStudentToDivision(student) {
  const { data, error } = await supabase
    .from("students")
    .insert([student])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeStudent(studentId) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);
  if (error) throw error;
  return true;
}

export async function getStudentClassDetails(studentId) {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      class_id,
      enrollment_date,
      academic_year,
      classes (
        class_id,
        name,
        section,
        academic_year
      ),
      class_subjects (
        subject_id,
        subjects (
          subject_id,
          name
        )
      )
    `)
    .eq('student_user_id', studentId)
    .single();

  if (error) throw error;

  const subjects = (data.class_subjects || []).map(cs => ({
    id: cs.subjects.subject_id,
    name: cs.subjects.name
  }));

  return {
    id: data.class_id,
    name: data.classes.name,
    section: data.classes.section,
    academicYear: data.classes.academic_year,
    teacher: {
      name: "Your Class Teacher" // optional hardcoded
    },
    subjects: subjects,
    performance: {
      totalQuizzes: 8,
      quizzesAttempted: 7,
      totalAssignments: 10,
      assignmentsSubmitted: 9,
      overallProgress: 78
    }
  };
}