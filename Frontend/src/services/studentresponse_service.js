import { supabase } from '../lib/supabaseClient';

// Submit a student assignment (response)
export const submitStudentResponse = async (assignmentId, studentUserId, submissionContentUrl, status = "submitted") => {
  const { data, error } = await supabase
    .from('student_assignments')
    .insert([{ 
      assignment_id: assignmentId, 
      student_user_id: studentUserId, 
      submitted_content_url: submissionContentUrl, 
      status 
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Fetch all responses for an assignment (teacher review)
export const getResponsesForAssignment = async (assignmentId) => {
  const { data, error } = await supabase
    .from('student_assignments')
    .select('*')
    .eq('assignment_id', assignmentId);
  if (error) throw error;
  return data;
};

// Update marks and feedback for a student's assignment
export const updateStudentScore = async (studentAssignmentId, marksObtained, feedback) => {
  const { data, error } = await supabase
    .from('student_assignments')
    .update({ marks_obtained: marksObtained, feedback })
    .eq('student_assignment_id', studentAssignmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Fetch all assignments submitted by a student
export const getStudentResponses = async (studentUserId) => {
  const { data, error } = await supabase
    .from('student_assignments')
    .select('*')
    .eq('student_user_id', studentUserId);
  if (error) throw error;
  return data;
};
