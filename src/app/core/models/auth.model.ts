export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}
