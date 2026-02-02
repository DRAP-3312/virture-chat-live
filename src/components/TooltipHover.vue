<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import type { ToolTipProps } from "../types/props";

const props = withDefaults(defineProps<ToolTipProps>(), {
  position: "top",
});

const visible = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

function updatePosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();

  if (props.position === "top") {
    tooltipStyle.value = {
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top}px`,
      transform: "translate(-50%, -100%)",
      paddingBottom: "8px",
    };
  } else {
    tooltipStyle.value = {
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.bottom}px`,
      transform: "translate(-50%, 0)",
      paddingTop: "8px",
    };
  }
}

function show() {
  updatePosition();
  visible.value = true;
}

function hide() {
  visible.value = false;
}

onBeforeUnmount(() => {
  visible.value = false;
});
</script>

<template>
  <div
    ref="triggerRef"
    class="inline-block"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <slot></slot>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="visible"
          class="fixed z-[9999] pointer-events-none"
          :style="tooltipStyle"
        >
          <div
            class="relative px-3 py-2 bg-slate-800 rounded-lg shadow-xl whitespace-nowrap"
          >
            <slot name="content"></slot>
            <!-- Arrow -->
            <div
              v-if="position === 'top'"
              class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"
            ></div>
            <div
              v-if="position === 'bottom'"
              class="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"
            ></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
