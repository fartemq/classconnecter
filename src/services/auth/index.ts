
// Re-export auth service components
import { loginUser, loginWithEmailAndPassword } from './loginService';
import { logoutUser } from './logoutService';
import { getUserProfile, updateUserProfile } from './userService';

export { 
  loginUser, 
  loginWithEmailAndPassword,
  logoutUser,
  getUserProfile,
  updateUserProfile
};

// Re-export the fetchUserRole from authUtils to prevent naming conflicts
export { fetchUserRole } from './authUtils';
