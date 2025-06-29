
// Новые надёжные сервисы
export { registerUserReliable as registerUser } from './reliableRegistrationService';
export { loginUserReliable as loginUser } from './reliableLoginService';
export { handleReliableEmailConfirmation, resendReliableConfirmation } from './reliableEmailConfirmationService';

// Остальные сервисы
export * from './logoutService';
export * from './userService';
export * from './types';
