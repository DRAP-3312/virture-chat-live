import {
  SocketEvent,
  type SendMessageData,
  type NavigationData,
  type SessionMetricsPayload,
} from "../types/socket-events";
import type { ChatMessage } from "../types/chat";

interface SocketLike {
  emit: (event: string, ...args: unknown[]) => unknown;
  connected?: boolean;
}

type MaybeSocket = SocketLike | null;

/**
 * Servicio centralizado para manejar todos los eventos de socket.io
 * Encapsula la lógica de emisión de eventos para que los componentes
 * no necesiten conocer los detalles de implementación.
 */

// ============================================
// EVENTOS CLIENTE → SERVIDOR (EMIT)
// ============================================

/**
 * Emite evento de conexión establecida y solicita el historial de mensajes
 */
export function emitConnectedChat(
  socket: MaybeSocket,
  data: { userUUID: string; agentId: string },
  callback: (response: { messages?: ChatMessage[] }) => void,
) {
  if (!socket) return;
  socket.emit(SocketEvent.CONNECTED_CHAT, data, callback);
}

/**
 * Envía un mensaje de chat del usuario al servidor
 */
export function emitSendChatMessage(
  socket: MaybeSocket,
  data: SendMessageData,
  callback: () => void,
) {
  if (!socket) return;
  socket.emit(SocketEvent.SEND_CHAT_MESSAGE, data, callback);
}

/**
 * Notifica al servidor si el usuario está escribiendo
 */
export function emitTypingUserState(socket: MaybeSocket, isTyping: boolean) {
  if (!socket) return;
  socket.emit(SocketEvent.TYPING_USER_STATE, isTyping);
}

/**
 * Rastrea la navegación del usuario (URL actual)
 */
export function emitNavigationPath(socket: MaybeSocket, data: NavigationData) {
  if (!socket) return;
  socket.emit(SocketEvent.NAVIGATION_PATH_CHAT, data);
}

/**
 * Solicita la configuración personalizada del widget
 */
export function emitGetCustomWidget(
  socket: MaybeSocket,
  agentId: string,
  callback: (config: Record<string, unknown>) => void,
) {
  if (!socket) return;
  socket.emit(SocketEvent.GET_CUSTOM_WIDGET, agentId, callback);
}

/**
 * Envía métricas de sesión del cliente al servidor
 */
export function emitMetricsChat(
  socket: MaybeSocket,
  metrics: SessionMetricsPayload,
) {
  if (!socket) return;
  socket.emit(SocketEvent.METRICS_CHAT, metrics);
}

// ============================================
// HELPERS
// ============================================

/**
 * Verifica si un socket está conectado
 */
export function isSocketConnected(socket: MaybeSocket): boolean {
  return socket?.connected ?? false;
}
