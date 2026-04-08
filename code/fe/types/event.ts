export interface EventItem {
  eventId: string;
  title: string;
  body: string;
  startTime: string; // "09:00:00"
  finishTime: string; // "11:30:00"
  eventDate: string; // "2026-04-02"
  schoolYear: number;
  term: number;
}

export interface EventListResponse {
  items: EventItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEventsParams {
  Title?: string;
  SchoolYear?: number;
  Term?: number;
}

export interface CreateEventPayload {
  title: string;
  body: string;
  startTime: string;
  finishTime: string;
  eventDate: string;
  schoolYear: number;
  term: number;
}
