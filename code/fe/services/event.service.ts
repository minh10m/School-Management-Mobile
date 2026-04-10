import { CreateEventPayload, EventItem, EventListResponse, GetEventsParams } from "../types/event";
import apiClient from "./apiClient";

export const eventService = {
  getEvents: async (params?: GetEventsParams): Promise<EventListResponse> => {
    // Explicitly map to PascalCase and provide safe defaults to avoid 400 Validation errors
    const backendParams: any = {
      Title: params?.Title || undefined,
      SchoolYear: Number(params?.SchoolYear || 2026),
      Term: Number(params?.Term || 1),
    };
    
    const response = await apiClient.get<EventListResponse>("/events", { params: backendParams });
    return response.data;
  },

  createEvent: async (payload: CreateEventPayload): Promise<EventItem> => {
    // Map to PascalCase for backend compatibility
    const backendPayload = {
      Title: payload.title,
      Body: payload.body,
      StartTime: payload.startTime,
      FinishTime: payload.finishTime,
      EventDate: payload.eventDate,
      SchoolYear: payload.schoolYear,
      Term: payload.term
    };
    const response = await apiClient.post<EventItem>("/events", backendPayload);
    return response.data;
  },

  updateEvent: async (id: string, payload: Partial<CreateEventPayload>): Promise<EventItem> => {
    const backendPayload: any = {};
    if (payload.title) backendPayload.Title = payload.title;
    if (payload.body) backendPayload.Body = payload.body;
    if (payload.startTime) backendPayload.StartTime = payload.startTime;
    if (payload.finishTime) backendPayload.FinishTime = payload.finishTime;
    if (payload.eventDate) backendPayload.EventDate = payload.eventDate;
    if (payload.schoolYear) backendPayload.SchoolYear = payload.schoolYear;
    if (payload.term) backendPayload.Term = payload.term;

    const response = await apiClient.put<EventItem>(`/events/${id}`, backendPayload);
    return response.data;
  },
};
