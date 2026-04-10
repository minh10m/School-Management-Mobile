// ─── Response Types ────────────────────────────────────────────────────────────

export interface RoleResponse {
  id: string;
  name: string;
  normalizedName: string;
}

export interface RoleListResponse {
  items: RoleResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetRolesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateRolePayload {
  name: string;
}

export interface UpdateRolePayload {
  name: string;
}
