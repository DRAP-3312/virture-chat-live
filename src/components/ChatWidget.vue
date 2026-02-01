<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { SendHorizontal } from "lucide-vue-next";
import ChatMessages from "./ChatMessages.vue";
import TypingIndicator from "./TypingIndicator.vue";
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

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isVisible = ref(false);
const typingUser = ref(false);
const showLocationFeedback = ref(false);
const showSoundFeedback = ref(false);

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
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

function eventTextArea(event: Event) {
  const input = (event.target as HTMLTextAreaElement).value;
  typingUser.value = input.trim() !== "";
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingUser.value = false;
  }, 1000);
}

watch(typingUser, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emitTypingUserState(props.socket, newVal);
  }
});

watch(isVisible, (val) => {
  if (val && textareaRef.value) {
    setTimeout(() => textareaRef.value?.focus(), 100);
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

function handleEnterKey() {
  if (window.innerWidth >= 1024) sendMessage();
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
    showLocationFeedback.value = true;
    setTimeout(() => {
      showLocationFeedback.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error al solicitar permiso de ubicacion:", error);
  }
}

function handleAudioPermission() {
  enableSound();
  setStateBtnAlert(true);
  showSoundFeedback.value = true;
  setTimeout(() => {
    showSoundFeedback.value = false;
  }, 3000);
}

onMounted(() => {
  filter.addWords(...badWordsSpanishList);
  textareaRef.value?.focus();
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
      <div
        class="flex p-2 w-full h-[10%] justify-between items-center relative"
        :style="{
          color: textColor,
          backgroundColor: backgroundColor,
        }"
      >
        <div
          v-if="iconButtonUrl"
          class="w-12 h-12 rounded-full overflow-hidden"
        >
          <img
            :src="iconButtonUrl"
            alt="img"
            class="w-full h-full object-cover rounded-full"
          />
        </div>
        <div class="flex p-2 grow gap-1 items-center">
          <div
            class="flex flex-col justify-center items-start gap-1"
            :style="{ color: textColor }"
          >
            <div class="flex justify-center items-center gap-1 text-sm">
              <strong>Bienvenido a</strong>
              <strong v-if="instanceName">{{ instanceName }}</strong>
            </div>
            <span class="text-xs">Estamos aqui para ayudarte.</span>
          </div>
        </div>
        <button
          class="absolute top-2 right-2 bg-transparent border-none text-[22px] font-bold cursor-pointer p-1 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-white/20"
          :style="{ color: textColor }"
          @click="handleClose"
        >
          ✕
        </button>
      </div>

      <div class="w-full h-0.5" :style="{ backgroundColor: textColor }" />

      <!-- Permission buttons -->
      <div v-if="!closeModalOption" class="w-full flex flex-col p-2">
        <div
          class="rounded-md flex gap-1 justify-between items-start shadow-lg"
          :style="{
            backgroundColor: backgroundColor,
            border: `1px solid ${textColor}`,
          }"
        >
          <div class="flex gap-1 p-2 w-full">
            <button
              v-if="!stateBtnUbication"
              class="flex gap-1 justify-center items-center px-3 py-1 rounded-md grow transition-all duration-200 hover:shadow-md permission-button"
              :style="{
                border: `1px solid ${accentColor}`,
                color: textColor,
                backgroundColor: 'transparent',
                '--accent-color': accentColor,
              }"
              @click="handleLocationPermission"
            >
              <p class="text-lg">📍</p>
              <p>Compartir ubicacion</p>
            </button>
            <button
              v-if="!stateBtnAlerts"
              class="flex gap-1 justify-center items-center px-3 py-1 rounded-md grow transition-all duration-200 hover:shadow-md permission-button"
              :style="{
                border: `1px solid ${accentColor}`,
                color: textColor,
                backgroundColor: 'transparent',
                '--accent-color': accentColor,
              }"
              @click="handleAudioPermission"
            >
              <p class="text-lg">🔊</p>
              <p>Recibir alertas</p>
            </button>
          </div>
          <div class="flex justify-end items-center">
            <button
              class="text-lg rounded-md w-8 h-8 justify-center items-center transition-colors duration-200 hover:opacity-70"
              :style="{ color: textColor }"
              @click="setCloseModalOption"
            >
              x
            </button>
          </div>
        </div>
      </div>

      <!-- Messages area -->
      <div
        class="flex flex-col grow overflow-y-auto bg-transparent p-2 relative"
      >
        <transition name="feedback-fade">
          <div
            v-if="showLocationFeedback"
            class="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span class="text-lg">✓</span>
            <span class="font-medium">Gracias por compartir tu ubicacion!</span>
          </div>
        </transition>

        <transition name="feedback-fade">
          <div
            v-if="showSoundFeedback"
            class="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-purple-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span class="text-lg">✓</span>
            <span class="font-medium">Notificaciones activadas</span>
          </div>
        </transition>

        <ChatMessages
          :text-color="textColor"
          :user-message-background="userMessageBackground"
          :user-message-text-color="userMessageTextColor"
          :bot-message-background="botMessageBackground"
          :bot-message-text-color="botMessageTextColor"
        />
      </div>

      <!-- Input area -->
      <div
        class="flex flex-col h-[10%]"
        :style="{ backgroundColor: backgroundColor }"
      >
        <transition name="fade-slide" mode="out-in">
          <div
            v-if="typingState === 'in-progress'"
            key="typing"
            class="flex items-center h-full w-full p-2"
          >
            <TypingIndicator :instance-name="instanceName" />
          </div>
          <div v-else key="input" class="flex gap-2 items-center p-2 h-full">
            <textarea
              ref="textareaRef"
              v-model="message"
              placeholder="Enviar mensaje..."
              class="grow p-2 outline-none resize-none text-gray-700 text-base lg:text-xs rounded-md transition duration-150 bg-transparent border border-gray-200 focus:border-gray-200 focus:ring-1 focus:ring-gray-200"
              :style="{
                backgroundColor: backgroundColor,
                color: textColor,
                borderColor: textColor,
              }"
              @keyup.enter="handleEnterKey"
              @input="eventTextArea"
            ></textarea>
            <button
              class="w-12.5 h-12.5 lg:hidden rounded-md text-white flex items-center justify-center transition-transform duration-200 hover:scale-105"
              :style="{ backgroundColor: accentColor }"
              @click="sendMessage"
            >
              <SendHorizontal :size="20" />
            </button>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}
.slide-fade-enter-from {
  transform: scale(0);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: scale(0.8);
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.feedback-fade-enter-active {
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}
.feedback-fade-leave-active {
  transition:
    opacity 0.3s ease-in,
    transform 0.3s ease-in;
}
.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}

.permission-button:hover {
  background-color: var(--accent-color) !important;
  opacity: 0.9;
}
</style>
