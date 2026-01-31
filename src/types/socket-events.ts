import type { ChatMessage } from './chat'

export interface ClientToServerEvents {
  'connected-chat': (utms: Record<string, string> | null, callback: (messages: ChatMessage[]) => void) => void
  'send-chat-message': (data: { message: string; messageType: string }, callback: (val: unknown) => void) => void
  'typing-user-state': (isTyping: boolean) => void
  'navigation-path-chat': (data: NavigationData) => void
  'get-custom-widget': (callback: (config: Record<string, unknown>) => void) => void
  'metrics-chat': (metrics: SessionMetricsPayload) => void
}

export interface ServerToClientEvents {
  'response': (message: ChatMessage) => void
  'lead-registered': () => void
  'scheduled_appointment': () => void
  'typing-state-widget': (state: string) => void
  'delete-message': (messageIds: string[]) => void
}

export interface NavigationData {
  urlPath: string
  time: string
  clientId: string
  instance: string
  utms: Record<string, string> | null
}

export interface SessionMetricsPayload {
  idClient: string
  browser: string
  browserVersion: string
  os: string
  deviceType: string
  screenWidth: number
  screenHeight: number
  userAgent: string
  clientLocation: ClientLocation | null
  referrer: string | null
}

export interface ClientLocation {
  country: string
  city: string
  region: string
  latitude: number | null
  longitude: number | null
  timezone: string
}
