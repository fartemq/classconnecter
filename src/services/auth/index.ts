
// Re-export all auth-related services from the new modular files
export * from './types';
export * from './registrationService';
export * from './loginService';
export * from './logoutService';

// Import and re-export userService but exclude fetchUserRole to avoid conflict
import { updateUserProfile, getUserProfile } from './userService';
export { updateUserProfile, getUserProfile };

// Import and re-export authUtils but exclude fetchUserRole to avoid conflict
import { hasRole } from './authUtils';
export { hasRole };
