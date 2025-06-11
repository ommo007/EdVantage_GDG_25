import { supabase } from '../lib/supabaseClient';

export async function getAssignedClasses(teacherId) {
  try {
    console.log('getAssignedClasses called with teacherId:', teacherId);
    
    const { data, error } = await supabase
      .from("class_subjects")
      .select(`
        class_id,
        classes(name, section, academic_year),
        subjects(name)
      `)
      .eq("teacher_user_id", teacherId);

    if (error) {
      console.error('Supabase error in getAssignedClasses:', error);
      throw error;
    }

    console.log('getAssignedClasses data received:', data);

    const grouped = data.reduce((acc, item) => {
      const id = item.class_id;
      if (!acc[id]) {
        acc[id] = {
          id,
          name: item.classes.name,
          section: item.classes.section,
          academicYear: item.classes.academic_year,
          subjects: [],
          studentCount: Math.floor(Math.random() * 10) + 20,
          nextSchedule: "2025-04-05 09:00 AM",
          recentActivity: "No recent activity",
          status: "active"
        };
      }
      acc[id].subjects.push(item.subjects.name);
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error('Error in getAssignedClasses:', error);
    throw error;
  }
}


export async function getClassDetails(classId) {
  try {
    console.log('getClassDetails called with classId:', classId);
    
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("class_id", classId)
      .single();

    if (error) {
      console.error('Supabase error in getClassDetails:', error);
      throw error;
    }

    console.log('getClassDetails data received:', data);
    return data;
  } catch (error) {
    console.error('Error in getClassDetails:', error);
    throw error;
  }
}


export async function assignTeacherToClassSubject(classId, subjectId, teacherId) {
  const { data, error } = await supabase
    .from("class_subjects")
    .insert([{ 
      class_id: classId,
      subject_id: subjectId,
      teacher_user_id: teacherId
    }]);
    
  if (error) throw error;
  return data;
}
