import { api } from "./client.js";

export function getAnalytics() {
  return api.get("/api/analytics");
}