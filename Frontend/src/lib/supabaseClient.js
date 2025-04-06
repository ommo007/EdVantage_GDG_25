
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fsztxvlitgukjqrxabmg.supabase.com"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzenR4dmxpdGd1a2pxcnhhYm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MjE4NTAsImV4cCI6MjA1ODk5Nzg1MH0.dR4UHKsT5Wj67e3iJ_VaC5OjJq99O8rv_bUxEfverDw"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);