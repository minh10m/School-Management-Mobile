export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userInfo?: UserInfo;
}

export interface LoginPayload {
  username?: string;
  password?: string;
}

export interface SignupPayload {
  name?: string;
  email?: string;
  password?: string;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
  confirmedPassword?: string;
}
