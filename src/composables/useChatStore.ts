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
const typingState = ref("");

export function useChatStore() {
  function addMessage(newMessage: ChatMessage) {
    setOpenChat(true);
    messages.value.push(newMessage);
  }

  function setMessages(val: ChatMessage[]) {
    messages.value = val;
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

  function setTypingStateWidget(state: string) {
    typingState.value = state;
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
      if (msg._id && messageIds.includes(msg._id)) {
        return { ...msg, deleteMarker: true };
      }
      return msg;
    });
  }

  return {
    messages,
    typingState,
    openChat,
    customStyle,
    closeModalOption,
    stateBtnAlerts,
    stateBtnUbication,
    addMessage,
    setMessages,
    setOpenChat,
    setCustomStyle,
    setCloseModalOption,
    setStateBtnAlert,
    setStateBtnUbication,
    setTypingStateWidget,
    deleteMessages,
  };
}
