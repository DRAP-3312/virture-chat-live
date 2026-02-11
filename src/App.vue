<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
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
import {
  DEFAULT_THEME,
  type ChatTheme,
  type WidgetPosition,
} from "./types/chat";
import "./style.css";
import type { WidgetProps } from "./types/props";

const props = withDefaults(defineProps<WidgetProps>(), {
  socketUrl: "http://localhost:7777",
  idAgent: "65d7a475abc4c71e14dee693",
  apiKey: "api",
  nameSpace: "/chat",
  gaTrackingId: "",
  welcomeMessage: "Bienvenido",
  iconButton: "",
  welcomeMessageButton: "Chatear Ahora!",
  soundName: "sound1",
  instanceName: "",
});

// Parse position prop (comes as JSON string from custom element attributes)
const parsedPosition = computed<WidgetPosition>(() => {
  if (!props.position) return {};
  if (typeof props.position === "string") {
    try {
      return JSON.parse(props.position) as WidgetPosition;
    } catch {
      return {};
    }
  }
  return props.position;
});

const positionMode = computed(() => parsedPosition.value.mode || "fixed");
const isFixedMode = computed(() => positionMode.value === "fixed");

const containerStyle = computed(() => {
  const pos = parsedPosition.value;
  const mode = pos.mode || "fixed";
  const style: Record<string, string> = {
    position: mode,
    zIndex: String(pos.zIndex ?? 1000),
  };

  if (mode === "fixed") {
    // Default fixed behavior: bottom-left corner
    style.bottom = pos.bottom ?? "20px";
    style.left = pos.left ?? "30px";
    if (pos.top) style.top = pos.top;
    if (pos.right) style.right = pos.right;
  } else {
    // For absolute/relative, only set values that were explicitly provided
    if (pos.top) style.top = pos.top;
    if (pos.right) style.right = pos.right;
    if (pos.bottom) style.bottom = pos.bottom;
    if (pos.left) style.left = pos.left;
  }

  return style;
});

const chatButtonRef = ref<HTMLButtonElement | null>(null);
const showGreetingModal = ref(false);
const showTypingIndicator = ref(false);

const { openChat, setOpenChat, customStyle } = useChatStore();
const {
  socket: chatSocket,
  sendMetricsNow,
  socketState,
} = useSocket(
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
  <div
    class="chat-container text-sm"
    :class="{ 'chat-open': openChat, 'chat-fixed': isFixedMode }"
    :style="containerStyle"
  >
    <!-- Typing indicator dots with enhanced animation -->
    <transition name="typing-bounce">
      <div
        v-if="showTypingIndicator"
        class="absolute bottom-20 left-[80%] flex items-center px-4 py-2.5 rounded-[16px_16px_16px_4px] shadow-lg z-[1000] backdrop-blur-sm"
        :style="{
          backgroundColor: resolveTheme('backgroundColor'),
          color: resolveTheme('textColor'),
          border: `1px solid ${resolveTheme('textColor')}15`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }"
      >
        <span
          v-for="i in 3"
          :key="i"
          class="h-2.5 w-2.5 mx-0.5 rounded-full typing-dot"
          :style="{
            backgroundColor: resolveTheme('accentColor'),
            animationDelay: `${(i - 1) * 0.15}s`,
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

    <!-- Chat button with enhanced animations -->
    <transition name="chat-button-appear">
      <button
        ref="chatButtonRef"
        v-if="!openChat"
        class="w-[3.75rem] h-[3.75rem] rounded-full overflow-hidden relative p-0 border-none shadow-lg transition-all duration-300 z-[1002] hover:scale-110 hover:shadow-xl active:scale-95 flex items-center justify-center cursor-pointer chat-button"
        :style="{
          backgroundColor: resolveTheme('accentColor'),
          boxShadow: `0 8px 16px ${resolveTheme('accentColor')}40, 0 4px 8px rgba(0,0,0,0.1)`,
        }"
        @click="toggleChat"
      >
        <!-- Ripple effect on hover -->
        <div class="absolute inset-0 rounded-full chat-button-ripple" />

        <img
          v-if="props.iconButton || customStyle.icon_button_url"
          :src="customStyle.icon_button_url || props.iconButton"
          alt="Chat logo"
          class="block w-full h-full object-cover relative z-10"
        />
        <MessageCircle
          v-else
          class="w-7 h-7 text-white relative z-10 transition-transform duration-300"
        />
      </button>
    </transition>

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
        :socket-state="socketState"
        @close="toggleChat"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  box-sizing: border-box;
}

@media (max-width: 800px) {
  .chat-container.chat-fixed {
    left: 10px;
  }
}

@media (max-width: 768px) {
  .chat-container.chat-fixed.chat-open {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    z-index: 1000;
  }

  .chat-container.chat-fixed:not(.chat-open) {
    position: fixed !important;
    bottom: 20px !important;
    left: 20px !important;
    right: auto !important;
    top: auto !important;
  }

  .chat-container.chat-fixed.chat-open button[class*="rounded-full"] {
    display: none;
  }

  .chat-container.chat-fixed.chat-open > div:last-child {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    height: 100dvh;
    width: 100dvw;
  }
}

/* Enhanced typing dots animation */
.typing-dot {
  animation: typing-bounce 1s ease-in-out infinite;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0) scale(1);
  }
  30% {
    opacity: 1;
    transform: translateY(-6px) scale(1.2);
  }
}

/* Improved typing indicator entrance */
.typing-bounce-enter-active {
  animation: typing-pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.typing-bounce-leave-active {
  animation: typing-pop-out 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes typing-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes typing-pop-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateY(5px);
  }
}

/* Chat button subtle fade animation */
.chat-button-appear-enter-active {
  transition: opacity 0.3s ease-out;
}

.chat-button-appear-leave-active {
  transition: opacity 0.2s ease-in;
}

.chat-button-appear-enter-from {
  opacity: 0;
}

.chat-button-appear-leave-to {
  opacity: 0;
}

/* Ripple effect on hover */
.chat-button:hover .chat-button-ripple {
  animation: ripple-effect 1.5s ease-out infinite;
}

@keyframes ripple-effect {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.6;
  }
  50% {
    box-shadow: 0 0 0 15px currentColor;
    opacity: 0.3;
  }
  100% {
    box-shadow: 0 0 0 30px currentColor;
    opacity: 0;
  }
}

/* Breathing animation removed to prevent visual conflicts */

/* Icon rotation on hover */
.chat-button:hover .w-7 {
  transform: rotate(15deg);
}
</style>
