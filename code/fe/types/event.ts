// ─── Response Types ────────────────────────────────────────────────────────────

export interface EventResponse {
  eventId: string;
  title: string;
  body: string;
  startTime: string;   // ISO datetime
  finishTime: string;
  schoolYear: string;
  term: string;
}

// ─── Query Params ──────────────────────────────────────────────────────────────

export interface GetEventsParams {
  term?: string;
  schoolYear?: string;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateEventPayload {
  title: string;
  body: string;
  startTime: string;
  finishTime: string;
  schoolYear: string;
  term: string;
}

export interface UpdateEventPayload {
  title?: string;
  body?: string;
  startTime?: string;
  finishTime?: string;
  schoolYear?: string;
  term?: string;
}
