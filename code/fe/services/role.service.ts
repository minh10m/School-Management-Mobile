import {
  CreateRolePayload,
  GetRolesParams,
  RoleListResponse,
  RoleResponse,
  UpdateRolePayload,
} from "../types/role";
import apiClient from "./apiClient";

export const roleService = {
  // ─── LIST ─────────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách role (có phân trang, sorted, filter)
   * GET /roles
   * AuthN(login) + AuthZ(Admin)
   */
  getRoles: async (params?: GetRolesParams): Promise<RoleListResponse> => {
    const response = await apiClient.get<RoleListResponse>("/roles", { params });
    return response.data;
  },

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  /**
   * Lấy thông tin một role theo id
   * GET /roles/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: role không tồn tại
   */
  getRoleById: async (roleId: string): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${roleId}`);
    return response.data;
  },

  // ─── CREATE ───────────────────────────────────────────────────────────────────
  /**
   * Thêm role mới
   * POST /roles
   * AuthN(login) + AuthZ(Admin)
   * 400: name thiếu hoặc sai format
   * 409: trùng tên
   */
  createRole: async (payload: CreateRolePayload): Promise<RoleResponse> => {
    const response = await apiClient.post<RoleResponse>("/roles", payload);
    return response.data;
  },

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  /**
   * Sửa thông tin role
   * PATCH /roles/{id}
   * AuthN(login) + AuthZ(Admin)
   * 400: thiếu thông tin hoặc sai format
   * 404: role không tồn tại
   * 409: tên bị trùng
   */
  updateRole: async (roleId: string, payload: UpdateRolePayload): Promise<RoleResponse> => {
    const response = await apiClient.patch<RoleResponse>(`/roles/${roleId}`, payload);
    return response.data;
  },
};
