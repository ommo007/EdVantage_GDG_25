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
  // Step 1: Get enrollment and class info
  const { data, error } = await supabase
    .from('student_enrollments')
    .select(`
      class_id,
      classes (
        class_id,
        name,
        section,
        academic_year
      )
    `)
    .eq('student_user_id', studentId)
    .single();

  if (error || !data) throw error || new Error("No enrollment found for this student.");

  // Step 2: Get subjects and teacher_user_id for this class
  const { data: classSubjects, error: csError } = await supabase
    .from('class_subjects')
    .select(`
      subject_id,
      teacher_user_id,
      subjects (
        subject_id,
        name
      )
    `)
    .eq('class_id', data.class_id);

  if (csError) throw csError;

  // Step 3: Get teacher names
  const teacherIds = [...new Set((classSubjects || []).map(cs => cs.teacher_user_id))];
  let teachers = [];
  if (teacherIds.length > 0) {
    const { data: teacherProfiles, error: tError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', teacherIds);

    if (tError) throw tError;
    teachers = teacherProfiles;
  }

  // Step 4: Map subjects to teachers
  const subjects = (classSubjects || []).map(cs => {
    const teacher = teachers.find(t => t.user_id === cs.teacher_user_id);
    return {
      id: cs.subjects.subject_id,
      name: cs.subjects.name,
      teacher: teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown"
    };
  });

  return {
    id: data.class_id,
    name: data.classes?.name || "Unknown",
    section: data.classes?.section || "Unknown",
    academicYear: data.classes?.academic_year || "Unknown",
    teachers: teachers.map(t => `${t.first_name} ${t.last_name}`),
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