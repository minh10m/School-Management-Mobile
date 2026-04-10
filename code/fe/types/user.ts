// ─── Response Types ────────────────────────────────────────────────────────────

export interface UserResponse {
  userId: string;
  userName: string;  // C# UserName → JSON userName
  email: string;
  phoneNumber: string;
  fullName: string;
  address: string;
  birthday: string; // ISO date string
  role: string;
  lockoutEnd?: string | null; // ISO datetime string or null
}

export interface UserListItem {
  userId: string;
  userName: string; // Changed from username to match backend JSON
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

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  phone: string;
  fullName: string;
  address: string;
  birthday: string; // ISO date string
  roleId: string;
  classYearId?: string; // Required if role = Student
  subjectId?: string[];   // Required if role = Teacher (Array of strings as per cURL)
}

export interface UpdateUserPayload {
  email?: string;
  phone?: string;
  fullName?: string;
  address?: string;
  birthday?: string;
  roleId?: string;
}

/** Admin reset password for a user */
export interface ResetPasswordPayload {
  newPassword: string;
}

/** Admin lock/unlock a user account */
export interface UpdateUserStatusPayload {
  lockoutEnd: string | null; // ISO datetime string or null to unlock
}

/** Admin change role of a user */
export interface UpdateUserRolePayload {
  roleId: string;
}
