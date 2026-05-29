import apiClient from './apiClient';
import { ApiResponse, BaseRequestSecond, PagedResponse } from '../types/common';
import { NotificationResponse } from '../types/notification';

export const notificationService = {
  getAllNotifications: async (request: BaseRequestSecond): Promise<PagedResponse<NotificationResponse>> => {
    try {
      const response = await apiClient.get<ApiResponse<PagedResponse<NotificationResponse>>>('/notifications', {
        params: request,
      });
      return response.data.data;
    } catch (error) {
      console.log('Error fetching notifications:', error);
      throw error;
    }
  },

  createNotification: async (payload: { userId: string[]; title: string; content: string; type: string }): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/notifications', payload);
      return response.data;
    } catch (error) {
      console.log('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Xóa thông báo theo ID
   * DELETE /notifications/{id}
   */
  deleteNotification: async (notificationId: string): Promise<any> => {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.log('Error deleting notification:', error);
      throw error;
    }
  },
};

