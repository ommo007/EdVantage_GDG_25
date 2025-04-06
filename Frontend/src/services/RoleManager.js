// List of valid roles
const validRoles = ["admin", "teacher", "student"];

// Check if a role is valid
export const isValidRole = (role) => validRoles.includes(role);

// Get the dashboard path for a role
export const getDashboardPath = (role) => {
  if (!isValidRole(role)) {
    return "/login"; // Fallback for invalid roles
  }
  return `/${role}/dashboard`;
};

// Get the default role (fallback)
export const getDefaultRole = () => "student"; // Default role