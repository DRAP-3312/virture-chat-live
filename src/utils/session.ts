import { v4 as uuidv4 } from "uuid";

const VISITOR_KEY = "userUUID";
const SESSION_KEY = "v2_session";

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionToken(): string | undefined {
  return localStorage.getItem(SESSION_KEY) ?? undefined;
}

export function setSessionToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(SESSION_KEY);
}
