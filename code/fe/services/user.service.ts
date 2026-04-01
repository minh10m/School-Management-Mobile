import {
  CreateUserPayload,
  GetUsersParams,
  ResetPasswordPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserListResponse,
  UserResponse,
} from "../types/user";
import apiClient from "./apiClient";

export const userService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách users với phân trang, sort, filter, search
   * GET /users?page=1&pageSize=10&search=&sortBy=createdAt&sortOrder=asc&role=admin
   * AuthN(login) + AuthZ(Admin)
   */
  getUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>("/users", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin một user bất kỳ (dành cho admin)
   * GET /users/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: user không tồn tại
   */
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  // ─── GET ME ───────────────────────────────────────────────────────────────────
  /**
   * Admin lấy thông tin của chính mình
   * GET /users/me
   * AuthN(login) + AuthZ(Admin)
   */
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>("/users/me");
    return response.data;
  },

  // ─── CREATE ───────────────────────────────────────────────────────────────────
  /**
   * Admin tạo tài khoản mới
   * POST /users
   * - role=Student → classYearId required
   * - role=Teacher → subjectId required
   * AuthN(login) + AuthZ(Admin)
   * 400: thiếu trường / sai format
   * 409: username hoặc email đã tồn tại
   */
  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    // Map Frontend Payload to Backend CreateUserRequest
    const backendPayload = {
      username: payload.username,
      password: payload.password,
      email: payload.email,
      phoneNumber: payload.phone,
      fullName: payload.fullName,
      address: payload.address,
      birthday: payload.birthday,
      roleId: payload.roleId,
      classYearId: payload.classYearId,
      subjectId: payload.subjectId
    };
    const response = await apiClient.post<UserResponse>("/users", backendPayload);
    return response.data;
  },

  // ─── UPDATE (admin updates any user) ─────────────────────────────────────────
  /**
   * Admin cập nhật thông tin người dùng
   * PATCH /users/{id}
   * AuthN(login) + AuthZ(Admin)
   * 400: sai format | 404: not found | 409: email lặp lại
   */
  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<UserResponse> => {
    const backendPayload: any = {
      email: payload.email,
      phoneNumber: payload.phone,
      fullName: payload.fullName,
      address: payload.address,
      birthday: payload.birthday,
    };
    const response = await apiClient.patch<UserResponse>(`/users/${userId}`, backendPayload);
    return response.data;
  },

  // ─── UPDATE ME (admin updates own profile) ────────────────────────────────────
  /**
   * Admin tự cập nhật thông tin bản thân (không thể sửa role)
   * PATCH /users/me
   * AuthN(login) + AuthZ(Admin)
   */
  updateMe: async (payload: Omit<UpdateUserPayload, "roleId">): Promise<UserResponse> => {
    const backendPayload: any = {
      email: payload.email,
      phoneNumber: payload.phone,
      fullName: payload.fullName,
      address: payload.address,
      birthday: payload.birthday,
    };
    const response = await apiClient.patch<UserResponse>("/users/me", backendPayload);
    return response.data;
  },

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────────
  /**
   * Admin reset mật khẩu cho người dùng
   * PATCH /users/{id}/reset-password
   * AuthN(login) + AuthZ(Admin)
   * 404: user không tồn tại
   * 400: password không đạt policy
   */
  resetPassword: async (userId: string, payload: ResetPasswordPayload): Promise<void> => {
    await apiClient.patch(`/users/${userId}/reset-password`, payload);
  },

  // ─── STATUS (lock / unlock) ───────────────────────────────────────────────────
  /**
   * Admin khóa / mở tài khoản người dùng
   * PATCH /users/{id}/status
   * lockoutEnd = ISO datetime (tương lai xa) → khóa hoàn toàn
   * lockoutEnd = null                        → mở khóa
   * AuthN(login) + AuthZ(Admin)
   * 404: user không tồn tại
   */
  updateStatus: async (userId: string, payload: UpdateUserStatusPayload): Promise<void> => {
    await apiClient.patch(`/users/${userId}/status`, payload);
  },

  // ─── CHANGE ROLE ──────────────────────────────────────────────────────────────
  /**
   * Admin thay đổi role cho người dùng (không thể đổi role của chính mình)
   * PATCH /users/{id}/role
   * AuthN(login) + AuthZ(Admin)
   * 404: ko tìm thấy | 400: roleId không hợp lệ
   */
  updateRole: async (userId: string, payload: UpdateUserRolePayload): Promise<UserResponse> => {
    const backendPayload = { role: payload.roleId };
    const response = await apiClient.patch<UserResponse>(`/users/${userId}/role`, backendPayload);
    return response.data;
  },
};
