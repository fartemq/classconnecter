
// Define shared types for authentication services
export type RegisterUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  city?: string;
  phone?: string;
  bio?: string;
};

export interface AuthResult {
  user: any;
  session: any | null;
}
