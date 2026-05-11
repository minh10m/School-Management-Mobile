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
};
