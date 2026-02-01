<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ChatHeader from "./ChatHeader.vue";
import PermissionButtons from "./PermissionButtons.vue";
import ChatMessages from "./ChatMessages.vue";
import TypingIndicator from "./TypingIndicator.vue";
import MessageInput from "./MessageInput.vue";
import { useChatStore } from "../composables/useChatStore";
import { useSessionMetrics } from "../composables/useSessionMetrics";
import { useSound } from "../composables/useSound";
import { getStoredUtms } from "../composables/useUtm";
import { sendFlexibleEvent, CHAT_EVENTS } from "../utils/analytics";
import { Filter } from "bad-words";
import { badWordsSpanishList } from "../utils/bad-words-es";
import {
  emitTypingUserState,
  emitSendChatMessage,
} from "../services/socketService";

interface SocketLike {
  emit: (event: string, ...args: unknown[]) => unknown;
  on: (event: string, callback: (...args: unknown[]) => void) => unknown;
}

const props = defineProps<{
  socket: SocketLike;
  sendMetricsNow: () => void;
  idAgent: string;
  apiKey: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  userMessageBackground: string;
  userMessageTextColor: string;
  botMessageBackground: string;
  botMessageTextColor: string;
  instanceName?: string;
  iconButtonUrl?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const messageInputRef = ref<InstanceType<typeof MessageInput> | null>(null);
const isVisible = ref(false);
const typingUser = ref(false);

const {
  messages,
  addMessage,
  closeModalOption,
  typingState,
  setCloseModalOption,
  stateBtnAlerts,
  stateBtnUbication,
  setStateBtnAlert,
  setStateBtnUbication,
} = useChatStore();

const { requestLocationPermission } = useSessionMetrics();
const { enableSound } = useSound();

const message = ref("");
const filter = new Filter();

function handleTyping(isTyping: boolean) {
  typingUser.value = isTyping;
}

watch(typingUser, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emitTypingUserState(props.socket, newVal);
  }
});

watch(isVisible, (val) => {
  if (val && messageInputRef.value) {
    setTimeout(() => messageInputRef.value?.focusInput(), 100);
  }
});

function sendMessage() {
  const valueToSend = filter.clean(message.value.trim());
  if (!valueToSend || !props.socket) return;

  const hasClientMessages = messages.value.some(
    (msg) => msg.role === "user" && !msg.deleteMarker,
  );

  const userUUID = localStorage.getItem("userUUID") ?? "";
  const utms = getStoredUtms();

  addMessage({ content: valueToSend, role: "user" });
  emitSendChatMessage(
    props.socket,
    {
      userUUID,
      message: valueToSend,
      agentId: props.idAgent,
      api_key: props.apiKey,
      utms,
    },
    () => {},
  );

  sendFlexibleEvent(CHAT_EVENTS.MESSAGE_SENT_CLIENT, {
    chat_session_id: userUUID,
    chat_message_length: valueToSend.length,
    chat_message_type: "text",
  });

  if (!hasClientMessages) {
    sendFlexibleEvent(CHAT_EVENTS.SESSION_STARTED, {
      chat_session_id: userUUID,
    });
  }

  message.value = "";
}

function handleClose() {
  sendFlexibleEvent(CHAT_EVENTS.WIDGET_CLOSED, { chat_form_close: true });
  isVisible.value = false;
  emit("close");
}

async function handleLocationPermission() {
  try {
    await requestLocationPermission();
    setStateBtnUbication(true);
    props.sendMetricsNow();
  } catch (error) {
    console.error("Error al solicitar permiso de ubicacion:", error);
  }
}

function handleAudioPermission() {
  enableSound();
  setStateBtnAlert(true);
}

onMounted(() => {
  filter.addWords(...badWordsSpanishList);
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});
</script>

<template>
  <transition name="slide-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 w-dvw h-dvh rounded-none m-0 flex flex-col overflow-hidden text-xs font-sans lg:relative lg:bottom-20 lg:left-0 lg:h-[70dvh] lg:w-[35vw] xl:w-[23vw] xl:h-[68dvh] lg:rounded-md lg:shadow-xl lg:m-0"
      :style="{ backgroundColor: backgroundColor }"
    >
      <!-- Header -->
      <ChatHeader
        :instance-name="instanceName"
        :icon-button-url="iconButtonUrl"
        :background-color="backgroundColor"
        :text-color="textColor"
        :accent-color="accentColor"
        @close="handleClose"
      />

      <!-- Permission buttons -->
      <PermissionButtons
        v-if="!closeModalOption"
        :text-color="textColor"
        :accent-color="accentColor"
        :state-btn-ubication="stateBtnUbication"
        :state-btn-alerts="stateBtnAlerts"
        @request-location="handleLocationPermission"
        @request-audio="handleAudioPermission"
        @close="setCloseModalOption"
      />

      <!-- Messages area -->
      <div
        class="flex flex-col grow overflow-y-auto bg-transparent p-2 relative"
      >
        <ChatMessages
          :text-color="textColor"
          :user-message-background="userMessageBackground"
          :user-message-text-color="userMessageTextColor"
          :bot-message-background="botMessageBackground"
          :bot-message-text-color="botMessageTextColor"
          :icon-button-url="iconButtonUrl"
          :instance-name="instanceName"
        />
      </div>

      <!-- Input area -->
      <div
        class="flex flex-col min-h-[10%]"
        :style="{ backgroundColor: backgroundColor }"
      >
        <transition name="fade-slide" mode="out-in">
          <div
            v-if="typingState === 'in-progress'"
            key="typing"
            class="flex items-center w-full"
          >
            <TypingIndicator
              :instance-name="instanceName"
              :icon-button-url="iconButtonUrl"
              :bot-message-background="botMessageBackground"
              :bot-message-text-color="botMessageTextColor"
              :text-color="textColor"
              :accent-color="accentColor"
            />
          </div>
          <MessageInput
            v-else
            key="input"
            ref="messageInputRef"
            v-model="message"
            :background-color="backgroundColor"
            :text-color="textColor"
            :accent-color="accentColor"
            @send="sendMessage"
            @typing="handleTyping"
          />
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Enhanced widget opening animation */
.slide-fade-enter-active {
  animation: widget-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  animation: widget-slide-out 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes widget-slide-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  50% {
    transform: scale(1.02) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes widget-slide-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}

/* Smooth transition for typing indicator and input */
.fade-slide-enter-active {
  animation: fade-slide-in 0.3s ease-out;
}

.fade-slide-leave-active {
  animation: fade-slide-out 0.2s ease-in;
}

@keyframes fade-slide-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-slide-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px);
  }
}
</style>
