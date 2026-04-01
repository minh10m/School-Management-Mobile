export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  userName?: string;
  passWord?: string;
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
