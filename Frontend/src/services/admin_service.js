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
    .insert([{ name: standardName, section }])
    .select()
    .single(); // <-- this ensures you get the inserted row

  if (error) throw error;
  return data;
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

//Division dashbaord queries

// --- DIVISION DETAILS ---
export async function getDivisionDetails(classId) {
  // Get division info
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('class_id, name, section')
    .eq('class_id', classId)
    .single();
  if (classError) throw classError;

  // Get student enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('student_enrollments')
    .select('student_user_id')
    .eq('class_id', classId);
  if (enrollmentsError) throw enrollmentsError;

  const studentIds = (enrollments || []).map(e => e.student_user_id);

  let studentList = [];
  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('user_id, first_name, last_name, email')
      .in('user_id', studentIds);
    if (studentsError) throw studentsError;
    studentList = students.map(s => ({
      id: s.user_id,
      name: `${s.first_name} ${s.last_name}`,
      email: s.email,
      status: "active"
    }));
  }

  // Get class_subjects (no joins)
  const { data: classSubjects, error: csError } = await supabase
    .from('class_subjects')
    .select('class_subject_id, subject_id, teacher_user_id')
    .eq('class_id', classId);
  if (csError) throw csError;

  // Fetch all subjects and teachers for those IDs
  const subjectIds = classSubjects.map(cs => cs.subject_id);
  const teacherIds = classSubjects.map(cs => cs.teacher_user_id);

  let subjects = [];
  if (subjectIds.length > 0) {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('subject_id, name')
      .in('subject_id', subjectIds);
    subjects = subjectData;
  }

  let teachers = [];
  if (teacherIds.length > 0) {
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('user_id, first_name, last_name, email')
      .in('user_id', teacherIds);
    teachers = teacherData;
  }

  // Map teachers and courses
  const teacherMap = {};
  const courseList = classSubjects.map(cs => {
    // Teachers
    const t = teachers.find(t => t.user_id === cs.teacher_user_id);
    if (t) {
      if (!teacherMap[t.user_id]) {
        teacherMap[t.user_id] = {
          id: t.user_id,
          name: `${t.first_name} ${t.last_name}`,
          email: t.email,
          subjects: []
        };
      }
      const subj = subjects.find(s => s.subject_id === cs.subject_id);
      if (subj) teacherMap[t.user_id].subjects.push(subj.name);
    }
    // Courses
    return {
      id: cs.class_subject_id,
      name: (subjects.find(s => s.subject_id === cs.subject_id) || {}).name || "Unknown",
      teacher: t ? `${t.first_name} ${t.last_name}` : "Unassigned",
      status: "active"
    };
  });

  const teacherList = Object.values(teacherMap);

  return {
    division: {
      id: classData.class_id,
      name: `Division ${classData.section}`,
      standardName: classData.name
    },
    students: studentList,
    teachers: teacherList,
    courses: courseList
  };
}

// --- STUDENTS ---
export async function addStudentToDivision(student_user_id, class_id) {
  const { data, error } = await supabase
    .from('student_enrollments')
    .insert([{ student_user_id, class_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeStudentFromDivision(student_user_id, class_id) {
  const { error } = await supabase
    .from('student_enrollments')
    .delete()
    .eq('student_user_id', student_user_id)
    .eq('class_id', class_id);
  if (error) throw error;
}

// --- TEACHERS ---
export async function addTeacherToDivision(teacher_user_id, class_id, subject_id) {
  const { data, error } = await supabase
    .from('class_subjects')
    .insert([{ teacher_user_id, class_id, subject_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeTeacherFromDivision(teacher_user_id, class_id, subject_id) {
  const { error } = await supabase
    .from('class_subjects')
    .delete()
    .eq('teacher_user_id', teacher_user_id)
    .eq('class_id', class_id)
    .eq('subject_id', subject_id);
  if (error) throw error;
}

// --- COURSES ---
export async function addCourseToDivision(class_id, subject_id, teacher_user_id) {
  const { data, error } = await supabase
    .from('class_subjects')
    .insert([{ class_id, subject_id, teacher_user_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCourseFromDivision(class_id, subject_id) {
  const { error } = await supabase
    .from('class_subjects')
    .delete()
    .eq('class_id', class_id)
    .eq('subject_id', subject_id);
  if (error) throw error;
}

// --- EDIT STUDENT/TEACHER/COURSE (for demo, just update name/email/status) ---
export async function editStudent(student_user_id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('user_id', student_user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function editTeacher(user_id, updates) {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function editCourse(class_subject_id, updates) {
  const { data, error } = await supabase
    .from('class_subjects')
    .update(updates)
    .eq('class_subject_id', class_subject_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}