export interface NotificationResponse {
  id: string;
  userId: string;
  content: string;
  isRead: boolean;
  isPopup: boolean;
  title: string;
  type: string;
  schoolYear: number;
  createdAt: string;
}
