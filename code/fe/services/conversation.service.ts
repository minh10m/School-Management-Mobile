import { ApiResponse, BaseRequestSecond, PagedResponse } from "../types/common";
import {
  AddMembersRequest,
  CheckMessageExistedResponse,
  ConversationResponse,
  CreateGroupRequest,
  GetConversationFilterRequest,
  GetMessageResponseDto,
  MessageResponse,
  SendMessageRequest,
  UpdateGroupRequest,
} from "../types/conversation";
import apiClient from "./apiClient";

export const conversationService = {
  // ─── CHECK CONVERSATION ───────────────────────────────────────────────────────
  /**
   * Kiểm tra xem đã có cuộc trò chuyện giữa người dùng hiện tại và otherUserId chưa
   * GET /conversations/check/{otherUserId}
   */
  checkConversation: async (otherUserId: string): Promise<ApiResponse<CheckMessageExistedResponse>> => {
    const response = await apiClient.get<ApiResponse<CheckMessageExistedResponse>>(`/conversations/check/${otherUserId}`);
    return response.data;
  },

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────────
  /**
   * Gửi tin nhắn mới
   * POST /conversations/send
   */
  sendMessage: async (payload: SendMessageRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>("/conversations/send", payload);
    return response.data;
  },

  // ─── GET MY CONVERSATIONS ─────────────────────────────────────────────────────
  /**
   * Lấy danh sách các cuộc trò chuyện của tôi
   * GET /conversations
   */
  getMyConversations: async (params?: GetConversationFilterRequest): Promise<PagedResponse<ConversationResponse>> => {
    const response = await apiClient.get<PagedResponse<ConversationResponse>>("/conversations", { params });
    return response.data;
  },

  // ─── GET MESSAGES ─────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách tin nhắn trong một cuộc trò chuyện
   * GET /conversations/{conversationId}/messages
   */
  getMessages: async (conversationId: string, params?: BaseRequestSecond): Promise<ApiResponse<GetMessageResponseDto>> => {
    const response = await apiClient.get<ApiResponse<GetMessageResponseDto>>(`/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  // ─── CREATE GROUP ─────────────────────────────────────────────────────────────
  /**
   * Tạo nhóm trò chuyện mới
   * POST /conversations/group
   */
  createGroup: async (payload: CreateGroupRequest | FormData): Promise<ApiResponse<string>> => {
    let data = payload;
    if (!(payload instanceof FormData)) {
      data = new FormData();
      (data as FormData).append("GroupName", payload.groupName);
      payload.memberIds.forEach((id) => (data as FormData).append("MemberIds", id));
      if (payload.avatar) {
        (data as FormData).append("Avatar", payload.avatar);
      }
    }

    const response = await apiClient.post<ApiResponse<string>>("/conversations/group", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ─── ADD MEMBERS TO GROUP ─────────────────────────────────────────────────────
  /**
   * Thêm thành viên vào nhóm trò chuyện
   * POST /conversations/group/members
   */
  addMembersToGroup: async (payload: AddMembersRequest): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post<ApiResponse<boolean>>("/conversations/group/members", payload);
    return response.data;
  },
  // ─── LEAVE GROUP ──────────────────────────────────────────────────────────────
  /**
   * Rời khỏi nhóm trò chuyện
   * DELETE /conversations/group/{conversationId}/leave
   */
  leaveGroup: async (conversationId: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/conversations/group/${conversationId}/leave`);
    return response.data;
  },
  // ─── UPDATE GROUP ─────────────────────────────────────────────────────────────
  /**
   * Cập nhật thông tin nhóm (Tên và Avatar)
   * PATCH /conversations/{conversationId}
   */
  updateGroup: async (conversationId: string, payload: FormData): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.patch<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
