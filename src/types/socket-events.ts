import type { ChatMessage, WidgetConfig } from './chat'

// Contrato v2 (namespace /v2/widget)
export const SocketEvent = {
  // Cliente -> servidor
  SESSION_START: 'session:start',
  MESSAGE_SEND: 'message:send',
  TYPING_SET: 'typing:set',
  NAVIGATION_TRACK: 'navigation:track',
  METRICS_REPORT: 'metrics:report',
  HISTORY_LOAD: 'history:load',

  // Servidor -> cliente
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  MESSAGE_NEW: 'message:new',
  TYPING_STATE: 'typing:state',
  MESSAGE_DELETED: 'message:deleted',
  CONFIG_UPDATED: 'config:updated',
  LEAD_REGISTERED: 'analytics:lead-registered',
  APPOINTMENT_SCHEDULED: 'analytics:appointment-scheduled',
} as const

export type SocketEventType = typeof SocketEvent[keyof typeof SocketEvent]

export interface SocketAuth {
  apiKey: string
  workspaceId: string
  widgetVersion: string
  sessionToken?: string
}

export type SendErrorCode =
  | 'conversation_locked'
  | 'rate_limited'
  | 'invalid_message'
  | 'internal'
  | 'offline'
  | 'timeout'

export interface SessionStartData {
  visitorId: string
}

export interface SessionStartAck {
  sessionToken: string
  visitorId: string
  messages: ChatMessage[]
  hasMore: boolean
  config: WidgetConfig
}

export interface SendMessageData {
  clientMessageId: string
  text: string
  utms: Record<string, string> | null
}

export type SendMessageAck =
  | { ok: true; message: { id: string; createdAt: string } }
  | { ok: false; error: { code: string; message: string } }

export interface TypingSetData {
  typing: boolean
}

export interface NavigationData {
  urlPath: string
  time: string
  utms: Record<string, string> | null
}

export interface HistoryLoadData {
  before: string
}

export interface HistoryLoadAck {
  messages: ChatMessage[]
  hasMore: boolean
}

export interface SessionMetricsPayload {
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

export interface ClientToServerEvents {
  'session:start': (data: SessionStartData, ack: (res: SessionStartAck) => void) => void
  'message:send': (data: SendMessageData, ack: (res: SendMessageAck) => void) => void
  'typing:set': (data: TypingSetData) => void
  'navigation:track': (data: NavigationData) => void
  'metrics:report': (metrics: SessionMetricsPayload) => void
  'history:load': (data: HistoryLoadData, ack: (res: HistoryLoadAck) => void) => void
}

export interface ServerToClientEvents {
  'message:new': (message: ChatMessage) => void
  'typing:state': (data: { typing: boolean }) => void
  'message:deleted': (data: { ids: string[] }) => void
  'config:updated': (config: WidgetConfig) => void
  'analytics:lead-registered': () => void
  'analytics:appointment-scheduled': () => void
}
