
// Re-export auth service components
import { loginUser, loginWithEmailAndPassword } from './loginService';
import { logoutUser } from './logoutService';
import { getUserProfile, updateUserProfile } from './userService';
import { registerUser } from './registrationService';

export { 
  loginUser, 
  loginWithEmailAndPassword,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  registerUser
};

// Re-export the fetchUserRole from authUtils to prevent naming conflicts
export { fetchUserRole } from './authUtils';
