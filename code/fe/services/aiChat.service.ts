import apiClient from "./apiClient";

// Inlined types to avoid stale module resolution
interface AIChatRequest {
  userQuestion: string;
}

interface AIChatResponse {
  aiResponse: string;
}

interface ChatHistoryItem {
  id: string;
  content: string;
  createdAt: string;
  role: "USER" | "AI";
  userId: string;
}

export const aiChatService = {
  chat: async (request: AIChatRequest): Promise<AIChatResponse> => {
    const res = await apiClient.post("/ai-chatbots/chat", request, {
      timeout: 60000,
    });
    return res.data.data;
  },

  getChatHistory: async (
    pageNumber = 1,
    pageSize = 50
  ): Promise<{ items: ChatHistoryItem[]; totalCount: number }> => {
    const res = await apiClient.get("/ai-chatbots/chat-history", {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
    return res.data.data;
  },

  uploadKnowledgeBase: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file as any);
    const res = await apiClient.post("/ai-chatbots/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.success;
  },

  /**
   * Xóa lịch sử chat với AI
   * DELETE /ai-chatbots
   */
  deleteChatHistory: async (): Promise<boolean> => {
    const res = await apiClient.delete("/ai-chatbots");
    return res.data.success;
  },
};
