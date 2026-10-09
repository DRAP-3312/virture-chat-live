import {
  SocketEvent,
  type SendMessageData,
  type SendMessageAck,
  type NavigationData,
  type SessionMetricsPayload,
  type SessionStartAck,
  type SessionStartData,
  type HistoryLoadData,
  type HistoryLoadAck,
} from "../types/socket-events";

interface SocketLike {
  emit: (event: string, ...args: unknown[]) => unknown;
  timeout?: (ms: number) => {
    emit: (event: string, ...args: unknown[]) => unknown;
  };
  connected?: boolean;
}

type MaybeSocket = SocketLike | null;

const ACK_TIMEOUT_MS = 10000;

/**
 * Emite con ack y timeout. Si el ack no llega, responde con `err`.
 */
function emitWithAck<T>(
  socket: SocketLike,
  event: string,
  data: unknown,
  onResult: (err: Error | null, res?: T) => void,
) {
  if (socket.timeout) {
    socket
      .timeout(ACK_TIMEOUT_MS)
      .emit(event, data, (err: Error | null, res: T) => onResult(err, res));
  } else {
    socket.emit(event, data, (res: T) => onResult(null, res));
  }
}

// ============================================
// EVENTOS CLIENTE -> SERVIDOR (EMIT)
// ============================================

export function emitSessionStart(
  socket: MaybeSocket,
  data: SessionStartData,
  onResult: (err: Error | null, res?: SessionStartAck) => void,
) {
  if (!socket) return;
  emitWithAck<SessionStartAck>(socket, SocketEvent.SESSION_START, data, onResult);
}

export function emitMessageSend(
  socket: MaybeSocket,
  data: SendMessageData,
  onResult: (err: Error | null, res?: SendMessageAck) => void,
) {
  if (!socket) return;
  emitWithAck<SendMessageAck>(socket, SocketEvent.MESSAGE_SEND, data, onResult);
}

export function emitTypingSet(socket: MaybeSocket, typing: boolean) {
  if (!socket) return;
  socket.emit(SocketEvent.TYPING_SET, { typing });
}

export function emitNavigationTrack(socket: MaybeSocket, data: NavigationData) {
  if (!socket) return;
  socket.emit(SocketEvent.NAVIGATION_TRACK, data);
}

export function emitMetricsReport(
  socket: MaybeSocket,
  metrics: SessionMetricsPayload,
) {
  if (!socket) return;
  socket.emit(SocketEvent.METRICS_REPORT, metrics);
}

export function emitHistoryLoad(
  socket: MaybeSocket,
  data: HistoryLoadData,
  onResult: (err: Error | null, res?: HistoryLoadAck) => void,
) {
  if (!socket) return;
  emitWithAck<HistoryLoadAck>(socket, SocketEvent.HISTORY_LOAD, data, onResult);
}

// ============================================
// HELPERS
// ============================================

export function isSocketConnected(socket: MaybeSocket): boolean {
  return socket?.connected ?? false;
}
