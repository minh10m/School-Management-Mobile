export interface AIChatRequest {
  userQuestion: string;
}

export interface AIChatResponse {
  aiResponse: string;
}

export interface ChatHistoryItem {
  id: string;
  content: string;
  createdAt: string;
  role: "USER" | "AI";
  userId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "USER" | "AI";
  createdAt: string;
}
