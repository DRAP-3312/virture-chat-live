import { ref } from "vue";
import type { ChatMessage, CustomStyle } from "../types/chat";

// Cargar estados guardados de localStorage
const loadSavedPermissions = () => {
  const savedAlerts = localStorage.getItem("permissionAlerts");
  const savedUbication = localStorage.getItem("permissionUbication");

  const alerts = savedAlerts === "true";
  const ubication = savedUbication === "true";

  return {
    alerts,
    ubication,
    shouldCloseModal: alerts && ubication,
  };
};

const savedPermissions = loadSavedPermissions();

const messages = ref<ChatMessage[]>([]);
const openChat = ref(false);
const customStyle = ref<CustomStyle>({});
const closeModalOption = ref(savedPermissions.shouldCloseModal);
const stateBtnAlerts = ref(savedPermissions.alerts);
const stateBtnUbication = ref(savedPermissions.ubication);
const typingState = ref(false);
const hasMore = ref(false);

const TYPING_SAFETY_MS = 8000;
let typingTimer: ReturnType<typeof setTimeout> | null = null;

export function useChatStore() {
  function addMessage(newMessage: ChatMessage) {
    setOpenChat(true);
    messages.value.push(newMessage);
  }

  // Mensaje entrante del servidor; dedupe por id
  function addIncomingMessage(newMessage: ChatMessage): boolean {
    if (newMessage.id && messages.value.some((m) => m.id === newMessage.id)) {
      return false;
    }
    addMessage(newMessage);
    return true;
  }

  function updateMessageByClientId(
    clientMessageId: string,
    patch: Partial<ChatMessage>,
  ) {
    messages.value = messages.value.map((m) =>
      m.clientMessageId === clientMessageId ? { ...m, ...patch } : m,
    );
  }

  function prependMessages(older: ChatMessage[]) {
    const known = new Set(messages.value.map((m) => m.id).filter(Boolean));
    messages.value = [
      ...older.filter((m) => !m.id || !known.has(m.id)),
      ...messages.value,
    ];
  }

  function setHasMore(val: boolean) {
    hasMore.value = val;
  }

  // Reemplaza el historial conservando los mensajes locales aun sin confirmar
  function setMessages(val: ChatMessage[]) {
    const pending = messages.value.filter(
      (m) => m.status === "sending" || m.status === "error",
    );
    messages.value = [...val, ...pending];
  }

  function setOpenChat(value: boolean) {
    openChat.value = value;
  }

  function setCustomStyle(val: CustomStyle) {
    customStyle.value = val;
  }

  function setCloseModalOption() {
    closeModalOption.value = true;
    // Marcar ambos permisos como "vistos" para no mostrar el modal de nuevo
    localStorage.setItem("permissionAlerts", "true");
    localStorage.setItem("permissionUbication", "true");
  }

  function setStateBtnAlert(val: boolean) {
    stateBtnAlerts.value = val;
    // Guardar en localStorage
    localStorage.setItem("permissionAlerts", val.toString());
    if (stateBtnAlerts.value && stateBtnUbication.value) {
      closeModalOption.value = true;
    }
  }

  function setTypingState(typing: boolean) {
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = null;
    typingState.value = typing;
    // Timeout de seguridad por si se pierde el "false"
    if (typing) {
      typingTimer = setTimeout(() => {
        typingState.value = false;
        typingTimer = null;
      }, TYPING_SAFETY_MS);
    }
  }

  function setStateBtnUbication(val: boolean) {
    stateBtnUbication.value = val;
    // Guardar en localStorage
    localStorage.setItem("permissionUbication", val.toString());
    if (stateBtnAlerts.value && stateBtnUbication.value) {
      closeModalOption.value = true;
    }
  }

  function deleteMessages(messageIds: string[]) {
    if (!Array.isArray(messageIds)) return;
    messages.value = messages.value.map((msg) => {
      if (msg.id && messageIds.includes(msg.id)) {
        return { ...msg, deleteMarker: true };
      }
      return msg;
    });
  }

  return {
    messages,
    typingState,
    hasMore,
    openChat,
    customStyle,
    closeModalOption,
    stateBtnAlerts,
    stateBtnUbication,
    addMessage,
    addIncomingMessage,
    updateMessageByClientId,
    prependMessages,
    setHasMore,
    setMessages,
    setOpenChat,
    setCustomStyle,
    setCloseModalOption,
    setStateBtnAlert,
    setStateBtnUbication,
    setTypingState,
    deleteMessages,
  };
}
