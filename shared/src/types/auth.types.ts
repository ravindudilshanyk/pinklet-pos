export type UserRole = "owner" | "cashier";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, "password">;
}

export interface LoginPayload {
  userId: string;
  password: string;
}
