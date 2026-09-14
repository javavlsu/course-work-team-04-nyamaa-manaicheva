import { api } from "./client.js";

export function getMyCalendar(options) {
  return api.get("/api/calendar", options);
}

export function getEventsByRange(calendarId, from, to, options) {
  const params = new URLSearchParams({ from, to });
  return api.get(`/api/calendar/${calendarId}/events?${params}`, options);
}

export function getEventById(eventId, options) {
  return api.get(`/api/calendar/events/${eventId}`, options);
}

export function createEvent(calendarId, data) {
  return api.post(`/api/calendar/${calendarId}/events`, data);
}

export function updateEvent(eventId, data) {
  return api.put(`/api/calendar/events/${eventId}`, data);
}

export function deleteEvent(eventId) {
  return api.delete(`/api/calendar/events/${eventId}`);
}

export function linkNote(eventId, noteId) {
  return api.post(`/api/calendar/events/${eventId}/note/${noteId}`);
}

export function unlinkNote(eventId) {
  return api.delete(`/api/calendar/events/${eventId}/note`);
}