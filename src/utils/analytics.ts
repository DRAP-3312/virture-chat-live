declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
    google_tag_manager: unknown;
  }
}

export function isGTMActive(): boolean {
  return !!(
    window.dataLayer &&
    Array.isArray(window.dataLayer) &&
    window.google_tag_manager
  );
}

export function pushToDataLayer(eventObject: Record<string, unknown>): void {
  if (
    typeof window.dataLayer !== "undefined" &&
    Array.isArray(window.dataLayer)
  ) {
    window.dataLayer.push(eventObject);
  }
}

export function initializeGoogleAnalytics(trackingId: string): void {
  if (!trackingId || isGTMActive()) return;
  if (window.gtag) {
    window.gtag("config", trackingId);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args as unknown as Record<string, unknown>);
  }
  window.gtag = gtag;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);
  script.onload = () => {
    window.gtag("js", new Date());
    window.gtag("config", trackingId);
  };
}

export function sendFlexibleEvent(
  eventName: string,
  params: Record<string, unknown>,
): void {
  pushToDataLayer({ event: eventName, ...params });
  if (window.gtag && !isGTMActive()) {
    window.gtag("event", eventName, params);
  }
}

export const CHAT_EVENTS = {
  SESSION_STARTED: "chat_session_started",
  WIDGET_OPENED: "chat_widget_opened",
  WIDGET_CLOSED: "chat_widget_closed",
  MESSAGE_SENT_CLIENT: "chat_message_sent_client",
  LEAD_REGISTERED: "chat_lead_registered",
  SCHEDULED_APPOINTMENT: "chat_scheduled_appointment",
} as const;
