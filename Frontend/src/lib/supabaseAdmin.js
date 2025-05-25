import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

// Use the regular supabase client for user creation
// This uses the anon key and signUp method as per Supabase docs
const supabaseUrl = "https://fsztxvlitgukjqrxabmg.supabase.co";

// Log configuration for debugging
console.log('Supabase Configuration for CSV Import:');
console.log('URL:', supabaseUrl);
console.log('Using regular supabase client with anon key');

// Function to create a user using the regular signUp method
export const createUserWithSignUp = async (email, password, userData = {}) => {
  console.log(`🔄 Attempting to create user: ${email}`);
  
  try {
    console.log(`📡 Making signUp API call for: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional user metadata
      }
    });

    if (error) {
      console.error(`❌ Supabase Auth Error for ${email}:`, error);
      throw error;
    }

    console.log(`✅ Successfully created user: ${email}`, data.user?.id);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Error creating user ${email}:`, {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error
    });
    return { data: null, error };
  }
};

// Function to create user profile using regular supabase client
export const createUserProfile = async (userId, profileData) => {
  console.log(`🔄 Creating profile for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        ...profileData
      });

    if (error) {
      console.error(`❌ Profile creation error for ${userId}:`, error);
      throw error;
    }

    console.log(`✅ Successfully created profile for user: ${userId}`);
    return { data, error: null };
  } catch (error) {
    console.error(`❌ Error creating profile for ${userId}:`, {
      message: error.message,
      details: error
    });
    return { data: null, error };
  }
};

// Test function to verify supabase client connectivity
export const testConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Try to get the current session (this tests basic connectivity)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session test failed:', sessionError);
      return { success: false, error: sessionError };
    }
    
    // Try to query a table to test database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Connection test successful');
    return { success: true, data: 'Connection successful' };
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return { success: false, error };
  }
};

// Legacy function name for backward compatibility
export const createUserWithAdmin = createUserWithSignUp;
export const testAdminConnection = testConnection; 