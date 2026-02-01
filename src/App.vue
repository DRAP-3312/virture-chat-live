<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { MessageCircle } from "lucide-vue-next";
import ChatWidget from "./components/ChatWidget.vue";
import WelcomeModal from "./components/WelcomeModal.vue";
import { useSocket } from "./composables/useSocket";
import { useChatStore } from "./composables/useChatStore";
import {
  initializeGoogleAnalytics,
  sendFlexibleEvent,
  CHAT_EVENTS,
} from "./utils/analytics";
import { DEFAULT_THEME, type ChatTheme } from "./types/chat";
import "./style.css";

const props = withDefaults(
  defineProps<{
    socketUrl?: string;
    idAgent?: string;
    apiKey?: string;
    nameSpace?: string;
    gaTrackingId?: string;
    welcomeMessage?: string;
    iconButton?: string;
    welcomeMessageButton?: string;
    soundName?: string;
    instanceName?: string;
    theme?: Partial<ChatTheme>;
  }>(),
  {
    socketUrl: "http://localhost:7777",
    idAgent: "65d7a475abc4c71e14dee693",
    apiKey:
      "api",
    nameSpace: "/chat",
    gaTrackingId: "",
    welcomeMessage: "Hola que tal",
    iconButton: "",
    welcomeMessageButton: "Chatear Ahora!",
    soundName: "sound1",
    instanceName: "Dev V2",
  },
);

const chatButtonRef = ref<HTMLButtonElement | null>(null);
const showGreetingModal = ref(false);
const showTypingIndicator = ref(false);

const { openChat, setOpenChat, customStyle } = useChatStore();
const { socket: chatSocket, sendMetricsNow } = useSocket(
  props.socketUrl,
  props.idAgent,
  props.apiKey,
  props.nameSpace,
  props.soundName,
);

// Merge theme with defaults and custom server style
function resolveTheme<K extends keyof ChatTheme>(key: K): string {
  return (
    (customStyle.value[key] as string) ||
    props.theme?.[key] ||
    DEFAULT_THEME[key]
  );
}

function toggleChat() {
  if (showGreetingModal.value) showGreetingModal.value = false;
  if (showTypingIndicator.value) showTypingIndicator.value = false;
  setOpenChat(!openChat.value);
  chatButtonRef.value?.classList.remove("chat-button-greet-animation");
}

function dismissGreeting() {
  showGreetingModal.value = false;
  chatButtonRef.value?.classList.remove("chat-button-greet-animation");
}

function startChat() {
  showGreetingModal.value = false;
  setOpenChat(true);
  chatButtonRef.value?.classList.remove("chat-button-greet-animation");
}

let typingTimer: ReturnType<typeof setTimeout> | null = null;
let modalTimer: ReturnType<typeof setTimeout> | null = null;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
let unwatchChatOpen: (() => void) | null = null;

function cleanupEffects() {
  if (typingTimer) clearTimeout(typingTimer);
  if (modalTimer) clearTimeout(modalTimer);
  if (autoDismissTimer) clearTimeout(autoDismissTimer);
  chatButtonRef.value?.classList.remove("chat-button-greet-animation");
  showTypingIndicator.value = false;
  showGreetingModal.value = false;
  if (unwatchChatOpen) unwatchChatOpen();
}

function setupTimers() {
  cleanupEffects();

  if (chatButtonRef.value && customStyle.value.visibility_welcome_modal) {
    typingTimer = setTimeout(() => {
      if (!openChat.value && !showGreetingModal.value) {
        showTypingIndicator.value = true;
      }
    }, 1000);

    modalTimer = setTimeout(() => {
      if (!openChat.value) {
        showTypingIndicator.value = false;
        showGreetingModal.value = true;
        chatButtonRef.value?.classList.add("chat-button-greet-animation");
      }
    }, 3500);

    const dismissTime =
      (customStyle.value.time_active_welcome_modal ?? 10) * 1000 + 4500;
    autoDismissTimer = setTimeout(() => {
      if (showGreetingModal.value) dismissGreeting();
      chatButtonRef.value?.classList.remove("chat-button-greet-animation");
    }, dismissTime);
  }
}

watch(
  customStyle,
  (newValue) => {
    if (newValue && !openChat.value) setupTimers();
  },
  { deep: true },
);

watch(openChat, (newValue) => {
  if (newValue) startChat();
  const event = newValue
    ? CHAT_EVENTS.WIDGET_OPENED
    : CHAT_EVENTS.WIDGET_CLOSED;
  const data = newValue ? { chat_form_open: true } : { chat_form_close: true };
  sendFlexibleEvent(event, data);
});

watch(
  () => props.gaTrackingId,
  (newVal, oldVal) => {
    if (newVal && oldVal !== newVal) initializeGoogleAnalytics(newVal);
  },
);

onMounted(() => {
  setupTimers();
  if (props.gaTrackingId) initializeGoogleAnalytics(props.gaTrackingId);
  unwatchChatOpen = watch(openChat, (newValue) => {
    if (newValue) cleanupEffects();
  });
});
</script>

<template>
  <div class="chat-container text-sm" :class="{ 'chat-open': openChat }">
    <!-- Typing indicator dots -->
    <transition name="typing-fade">
      <div
        v-if="showTypingIndicator"
        class="absolute bottom-20 left-[80%] flex items-center px-3 py-2 rounded-[15px_15px_15px_5px] shadow-md z-1000"
        :style="{
          backgroundColor: resolveTheme('backgroundColor'),
          color: resolveTheme('textColor'),
        }"
      >
        <span
          v-for="i in 3"
          :key="i"
          class="h-2 w-2 mx-0.5 rounded-full opacity-40 animate-[typing-dots_1.2s_ease-in-out_infinite]"
          :style="{
            backgroundColor: resolveTheme('textColor'),
            animationDelay: `${(i - 1) * 0.2}s`,
          }"
        ></span>
      </div>
    </transition>

    <!-- Welcome modal -->
    <WelcomeModal
      v-if="showGreetingModal"
      :message="
        customStyle.welcomeMessage ||
        props.welcomeMessage ||
        'Hola! Bienvenido. Si necesitas ayuda con tu busqueda o tienes alguna consulta, no dudes en iniciar un chat. Estamos aqui para asistirte!'
      "
      :button-text="
        customStyle.welcomeMessageButton || props.welcomeMessageButton
      "
      :background-color="resolveTheme('backgroundColor')"
      :text-color="resolveTheme('textColor')"
      :button-color="resolveTheme('accentColor')"
      :show-close-button="customStyle.btn_close_welcome_modal ?? false"
      @start="startChat"
      @dismiss="dismissGreeting"
    />

    <!-- Chat button -->
    <button
      ref="chatButtonRef"
      v-if="!openChat"
      class="w-15 h-15 rounded-full overflow-hidden relative p-0 border-none shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 z-1002 hover:scale-105 flex items-center justify-center cursor-pointer"
      :style="{ backgroundColor: resolveTheme('accentColor') }"
      @click="toggleChat"
    >
      <img
        v-if="props.iconButton || customStyle.icon_button_url"
        :src="customStyle.icon_button_url || props.iconButton"
        alt="Chat logo"
        class="block w-full h-full object-cover"
      />
      <MessageCircle v-else class="w-7 h-7 text-white" />
    </button>

    <!-- Chat panel -->
    <div v-if="openChat" class="relative">
      <ChatWidget
        v-if="chatSocket"
        :socket="chatSocket"
        :send-metrics-now="sendMetricsNow"
        :id-agent="props.idAgent"
        :api-key="props.apiKey"
        :background-color="resolveTheme('backgroundColor')"
        :text-color="resolveTheme('textColor')"
        :accent-color="resolveTheme('accentColor')"
        :user-message-background="resolveTheme('userMessageBackground')"
        :user-message-text-color="resolveTheme('userMessageTextColor')"
        :bot-message-background="resolveTheme('botMessageBackground')"
        :bot-message-text-color="resolveTheme('botMessageTextColor')"
        :instance-name="instanceName"
        :icon-button-url="customStyle.icon_button_url"
        @close="toggleChat"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 20px;
  left: 30px;
  z-index: 1000;
}

@media (max-width: 800px) {
  .chat-container {
    left: 10px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 1000;
  }

  .chat-container:not(.chat-open) {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: auto;
    top: auto;
  }

  .chat-container.chat-open button[class*="rounded-full"] {
    display: none;
  }

  .chat-container.chat-open > div:last-child {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    height: 100dvh;
    width: 100dvw;
  }
}

@keyframes typing-dots {
  0%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.typing-fade-enter-active,
.typing-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

@keyframes greet-wave {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}

:deep(.chat-button-greet-animation) {
  animation: greet-wave 1s ease-in-out infinite;
}
</style>
