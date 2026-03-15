import {
  CreateEventPayload,
  EventResponse,
  GetEventsParams,
  UpdateEventPayload,
} from "../types/event";
import apiClient from "./apiClient";

export const eventService = {
  /**
   * Lấy danh sách sự kiện theo kì / năm học
   * GET /events?term=&schoolYear=
   * AuthN(login)
   */
  getEvents: async (params?: GetEventsParams): Promise<EventResponse[]> => {
    const response = await apiClient.get<EventResponse[]>("/events", { params });
    return response.data;
  },

  /**
   * Xem chi tiết sự kiện theo id
   * GET /events/{id}
   * AuthN(login)
   * 404: event không tồn tại
   */
  getEventById: async (eventId: string): Promise<EventResponse> => {
    const response = await apiClient.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Admin tạo sự kiện
   * POST /events
   * AuthN(login) + AuthZ(Admin)
   * 409: finishTime phải lớn hơn startTime | sự kiện bị trùng thời gian
   */
  createEvent: async (payload: CreateEventPayload): Promise<EventResponse> => {
    const response = await apiClient.post<EventResponse>("/events", payload);
    return response.data;
  },

  /**
   * Admin sửa sự kiện
   * PATCH /events/{id}
   * AuthN(login) + AuthZ(Admin)
   * 404: event không tồn tại
   */
  updateEvent: async (eventId: string, payload: UpdateEventPayload): Promise<EventResponse> => {
    const response = await apiClient.patch<EventResponse>(`/events/${eventId}`, payload);
    return response.data;
  },
};
