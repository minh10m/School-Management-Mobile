export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  address: string;
  birthday: string; // ISO date string
  role: string;
}

export interface UserListItem {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
  lockoutEnd: string | null; // null = không bị khóa
}

export interface UserListResponse {
  items: UserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  phone: string;
  fullName: string;
  address: string;
  birthday: string;
  roleId: string;
  classYearId?: string;
  subjectId?: string;
}

export interface UpdateUserPayload {
  email?: string;
  phone?: string;
  fullName?: string;
  address?: string;
  birthday?: string;
  roleId?: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface UpdateUserStatusPayload {
  lockoutEnd: string | null;
}

export interface UpdateUserRolePayload {
  roleId: string;
}
