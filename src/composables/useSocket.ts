import { ref, shallowRef, onMounted, onUnmounted, type ShallowRef, type Ref } from "vue";
import { Manager, type Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { captureUtm, getStoredUtms } from "./useUtm";
import { sendFlexibleEvent, CHAT_EVENTS } from "../utils/analytics";
import { useSessionMetrics } from "./useSessionMetrics";
import { useSound } from "./useSound";
import {
  getVisitorId,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
} from "../utils/session";
import { SocketEvent, type SocketAuth } from "../types/socket-events";
import type { ChatMessage, WidgetConfig } from "../types/chat";
import {
  emitSessionStart,
  emitNavigationTrack,
  emitMetricsReport,
} from "../services/socketService";

function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (
    obj1 === null ||
    typeof obj1 !== "object" ||
    obj2 === null ||
    typeof obj2 !== "object"
  )
    return false;

  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    const v1 = (obj1 as Record<string, unknown>)[key];
    const v2 = (obj2 as Record<string, unknown>)[key];
    if (typeof v1 === "object" && v1 !== null) {
      if (!deepEqual(v1, v2)) return false;
    } else if (v1 !== v2) {
      return false;
    }
  }
  return true;
}

export function useSocket(
  socketUrl: string,
  workspaceId: string,
  apiKey: string,
  nameSpace: string,
  soundName: string,
): {
  socket: ShallowRef<Socket | null>;
  manager: ShallowRef<Manager | null>;
  sendMetricsNow: () => void;
  socketState: Ref<boolean>;
} {
  const socket = shallowRef<Socket | null>(null);
  const manager = shallowRef<Manager | null>(null);
  const metricsInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const lastPath = ref("");
  const socketState = ref(false);

  const {
    setMessages,
    setHasMore,
    addIncomingMessage,
    setCustomStyle,
    customStyle,
    setTypingState,
    deleteMessages,
  } = useChatStore();

  const { playSound } = useSound();
  const { sessionInfo } = useSessionMetrics();

  let lastMetrics: unknown = null;
  let restoreHistory: (() => void) | null = null;

  function hasValidLocation(
    location: {
      latitude: number | null;
      longitude: number | null;
      country: string;
      city: string;
      region: string;
      timezone: string;
    } | null,
  ): boolean {
    if (!location) return false;
    if (location.latitude !== null && location.longitude !== null) return true;
    return (
      location.country !== "Unknown" ||
      location.city !== "Unknown" ||
      location.region !== "Unknown" ||
      location.timezone !== "Unknown"
    );
  }

  function prepareMetrics() {
    const metrics = { ...sessionInfo.value };
    if (!hasValidLocation(metrics.clientLocation)) {
      return { ...metrics, clientLocation: null };
    }
    return metrics;
  }

  function startSession() {
    const visitorId = getVisitorId();
    emitSessionStart(socket.value, { visitorId }, (err, res) => {
      if (err || !res) {
        console.error("session:start fallo", err);
        return;
      }
      if ("ok" in res) {
        console.error("session:start rechazado", res.error);
        return;
      }
      if (res.sessionToken) setSessionToken(res.sessionToken);
      setMessages((res.messages ?? []) as ChatMessage[]);
      setHasMore(!!res.hasMore);
      if (res.config) setCustomStyle({ ...res.config });
      // Reenvia la ruta actual tras (re)conectar
      lastPath.value = "";
      trackNavigation();
    });
  }

  function initializeSocket() {
    manager.value = new Manager(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // `auth` como funcion: en cada (re)conexion lee el sessionToken vigente
    socket.value = manager.value.socket(nameSpace, {
      auth: (cb: (data: SocketAuth) => void) => {
        cb({
          apiKey,
          workspaceId,
          widgetVersion: __WIDGET_VERSION__,
          sessionToken: getSessionToken(),
        });
      },
    });

    socket.value.on(SocketEvent.CONNECT, () => {
      socketState.value = true;
      startSession();
    });

    socket.value.on(SocketEvent.DISCONNECT, () => {
      socketState.value = false;
    });

    socket.value.on(SocketEvent.CONNECT_ERROR, (err: Error) => {
      socketState.value = false;
      if (err.message === "unauthorized") {
        // Credenciales invalidas: no reintentar
        clearSessionToken();
        socket.value?.disconnect();
        console.error("virture-chat-live: unauthorized (apiKey/workspaceId)");
      }
    });

    socket.value.on(SocketEvent.MESSAGE_NEW, (msg: ChatMessage) => {
      if (addIncomingMessage(msg)) {
        playSound(customStyle.value.soundName ?? soundName ?? "sound1");
      }
    });

    socket.value.on(SocketEvent.TYPING_STATE, (data: { typing: boolean }) => {
      setTypingState(!!data?.typing);
    });

    socket.value.on(SocketEvent.MESSAGE_DELETED, (data: { ids: string[] }) => {
      deleteMessages(data?.ids);
    });

    socket.value.on(SocketEvent.CONFIG_UPDATED, (config: WidgetConfig) => {
      if (config) setCustomStyle({ ...config });
    });

    socket.value.on(SocketEvent.LEAD_REGISTERED, () => {
      sendFlexibleEvent(CHAT_EVENTS.LEAD_REGISTERED, {
        chat_session_id: getVisitorId(),
      });
    });

    socket.value.on(SocketEvent.APPOINTMENT_SCHEDULED, () => {
      sendFlexibleEvent(CHAT_EVENTS.SCHEDULED_APPOINTMENT, {
        chat_session_id: getVisitorId(),
      });
    });
  }

  function trackNavigation() {
    const currentPath = window.location.href;
    if (currentPath === lastPath.value) return;
    lastPath.value = currentPath;
    emitNavigationTrack(socket.value, {
      urlPath: currentPath,
      time: new Date().toISOString(),
      utms: getStoredUtms(),
    });
  }

  // Detecta navegacion SPA (pushState/replaceState) ademas de popstate/hashchange
  function setupNavigationTracking() {
    const onChange = () => trackNavigation();
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    const patchedPush: typeof history.pushState = function (this: History, ...args) {
      const r = origPush.apply(this, args);
      onChange();
      return r;
    };
    const patchedReplace: typeof history.replaceState = function (this: History, ...args) {
      const r = origReplace.apply(this, args);
      onChange();
      return r;
    };
    history.pushState = patchedPush;
    history.replaceState = patchedReplace;
    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);

    restoreHistory = () => {
      // Solo restaura si nadie mas lo envolvio despues
      if (history.pushState === patchedPush) history.pushState = origPush;
      if (history.replaceState === patchedReplace) {
        history.replaceState = origReplace;
      }
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }

  function setupMetricsTracking() {
    metricsInterval.value = setInterval(() => {
      const currentMetrics = prepareMetrics();
      if (!deepEqual(lastMetrics, currentMetrics)) {
        emitMetricsReport(socket.value, currentMetrics);
        lastMetrics = currentMetrics;
      }
    }, 10000);
  }

  function sendMetricsNow() {
    const currentMetrics = prepareMetrics();
    emitMetricsReport(socket.value, currentMetrics);
    lastMetrics = currentMetrics;
  }

  onMounted(() => {
    captureUtm(window.location.href);
    initializeSocket();
    setupNavigationTracking();
    setupMetricsTracking();
  });

  onUnmounted(() => {
    if (metricsInterval.value) clearInterval(metricsInterval.value);
    if (restoreHistory) restoreHistory();

    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
    if (manager.value) {
      manager.value = null;
    }
  });

  return {
    socket,
    manager,
    sendMetricsNow,
    socketState,
  };
}
