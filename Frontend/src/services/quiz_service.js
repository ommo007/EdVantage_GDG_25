import { supabase } from "../lib/supabaseClient";

export async function generateQuizViaAI(subjectId) {
  // Call your AI endpoint (not Supabase)
  const response = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId }),
  });
  if (!response.ok) throw new Error("AI quiz generation failed");
  return await response.json();
}

export async function saveQuiz(quiz) {
  const { data, error } = await supabase
    .from("quizzes")
    .insert([quiz])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function assignQuizToClass(classId, divisionId, quizId) {
  const { data, error } = await supabase
    .from("class_quizzes")
    .insert([{ class_id: classId, division_id: divisionId, quiz_id: quizId }]);
  if (error) throw error;
  return data;
}

export async function getQuizzesForStudent(classId) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("class_id", classId);
  if (error) throw error;
  return data;
}

export async function submitQuiz(studentId, quizId, answers) {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .insert([{ student_id: studentId, quiz_id: quizId, answers }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getQuizSubmissions(quizId) {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select("*")
    .eq("quiz_id", quizId);
  if (error) throw error;
  return data;
}