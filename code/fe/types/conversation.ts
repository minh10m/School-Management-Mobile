import { BaseRequestSecond, PagedResponse } from "./common";

export interface ConversationResponse {
  conversationId: string;
  displayName: string;
  unReadCount: number;
  lastUpdatedAt: string;
  isGroup: boolean;
  lastMessage?: string | null;
  avatarUrl?: string | null;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
}

export interface MemberInfo {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface GetMessageResponseDto {
  messageResponse: PagedResponse<MessageResponse>;
  memberInfos: MemberInfo[];
}

export interface SendMessageRequest {
  conversationId?: string;
  receiverId?: string;
  content: string;
}

export interface CreateGroupRequest {
  groupName: string;
  memberIds: string[];
}

export interface AddMembersRequest {
  conversationId: string;
  memberIds: string[];
}

export interface CheckMessageExistedResponse {
  conversationId: string | null;
}

export interface GetConversationFilterRequest extends BaseRequestSecond {
  displayName?: string;
}

export interface UpdateGroupRequest {
  conversationName?: string;
  avatar?: any; // For FormData
}
