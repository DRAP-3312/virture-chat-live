import { ref, onMounted, onUnmounted } from "vue";
import { Manager, type Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "./useChatStore";
import { captureUtm, getStoredUtms } from "./useUtm";
import { sendFlexibleEvent, CHAT_EVENTS } from "../utils/analytics";
import { useSessionMetrics } from "./useSessionMetrics";
import { useSound } from "./useSound";
import type { CustomStyle } from "../types/chat";

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

function shallowEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

function getUserUUID(): string {
  let userUUID = localStorage.getItem("userUUID");
  if (!userUUID) {
    userUUID = uuidv4();
    localStorage.setItem("userUUID", userUUID);
  }
  return userUUID;
}

export function useSocket(
  socketUrl: string,
  idAgent: string,
  apiKey: string,
  nameSpace: string,
  soundName: string,
) {
  const socket = ref<Socket | null>(null);
  const manager = ref<Manager | null>(null);
  const navigationInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const widgetInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const metricsInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const lastPath = ref("");

  const {
    setMessages,
    addMessage,
    setCustomStyle,
    customStyle,
    setTypingStateWidget,
    deleteMessages,
  } = useChatStore();

  const { playSound } = useSound();
  const { sessionInfo } = useSessionMetrics();

  let lastMetrics: unknown = null;

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
    const metrics = {
      idClient: getUserUUID(),
      ...sessionInfo.value,
    };
    if (!hasValidLocation(metrics.clientLocation)) {
      return { ...metrics, clientLocation: null };
    }
    return metrics;
  }

  function initializeSocket() {
    const userUUID = getUserUUID();

    manager.value = new Manager(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        idOwner: userUUID,
        api_key: apiKey,
        idClient: userUUID,
        instance: idAgent,
      },
    });

    socket.value = manager.value.socket(nameSpace);

    socket.value.on("connect", () => {
      socket.value!.emit(
        "connected-chat",
        { userUUID, agentId: idAgent },
        (val: { messages?: import("../types/chat").ChatMessage[] }) => {
          if (val.messages) {
            setMessages(val.messages);
          }
        },
      );
    });

    socket.value.on("disconnect", () => {});

    socket.value.on("response", (val: unknown) => {
      const msg = val as import("../types/chat").ChatMessage;
      addMessage(msg);
      playSound(customStyle.value.soundName ?? soundName ?? "sound1");
    });

    socket.value.on("lead-registered", () => {
      sendFlexibleEvent(CHAT_EVENTS.LEAD_REGISTERED, {
        chat_session_id: userUUID,
      });
    });

    socket.value.on("scheduled_appointment", () => {
      sendFlexibleEvent(CHAT_EVENTS.SCHEDULED_APPOINTMENT, {
        chat_session_id: userUUID,
      });
    });

    socket.value.on("typing-state-widget", (stateWidget: string) => {
      setTypingStateWidget(stateWidget);
    });

    socket.value.on("delete-message", (messageIds: string[]) => {
      deleteMessages(messageIds);
    });
  }

  function setupNavigationTracking() {
    navigationInterval.value = setInterval(() => {
      const currentPath = window.location.href;
      const utms = getStoredUtms();

      if (currentPath !== lastPath.value) {
        const now = new Date();
        socket.value?.emit("navigation-path-chat", {
          urlPath: currentPath,
          time: now.toISOString(),
          clientId: getUserUUID(),
          instance: idAgent,
          utms,
        });
        lastPath.value = currentPath;
      }
    }, 2000);
  }

  function setupWidgetConfig() {
    widgetInterval.value = setInterval(() => {
      socket.value?.emit("get-custom-widget", idAgent, (val: CustomStyle) => {
        if (
          !shallowEqual(
            val as unknown as Record<string, unknown>,
            customStyle.value as unknown as Record<string, unknown>,
          )
        ) {
          setCustomStyle({ ...val });
        }
      });
    }, 1000);
  }

  function setupMetricsTracking() {
    metricsInterval.value = setInterval(() => {
      const currentMetrics = prepareMetrics();
      if (!deepEqual(lastMetrics, currentMetrics)) {
        socket.value?.emit("metrics-chat", currentMetrics);
        lastMetrics = currentMetrics;
      }
    }, 10000);
  }

  function sendMetricsNow() {
    const currentMetrics = prepareMetrics();
    socket.value?.emit("metrics-chat", currentMetrics);
    lastMetrics = currentMetrics;
  }

  onMounted(() => {
    captureUtm(window.location.href);
    initializeSocket();
    setupWidgetConfig();
    setupNavigationTracking();
    setupMetricsTracking();
  });

  onUnmounted(() => {
    if (navigationInterval.value) clearInterval(navigationInterval.value);
    if (widgetInterval.value) clearInterval(widgetInterval.value);
    if (metricsInterval.value) clearInterval(metricsInterval.value);

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
  };
}
