<template>
  <div
    class="numbox"
    :style="cssVars"
    :class="{ 'show-border': showBorder }"
    @mousedown="onMouseDown"
    @doubleclick="onDoubleClick"
  >
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      aria-hidden="true"
      class="num-trianlge"
    >
      <polygon points="0,0 0,12 8,6" :fill="triangleColor" />
    </svg>

    <span class="num-value">{{ modelValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import theme from '@/theme.ts';
import { round, clamp } from '@/util/math-helpers.ts';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    required: true,
    type: Number
  },
  minValue: {
    type: Number,
    required: false,
    default: 0
  },
  maxValue: {
    type: Number,
    required: false,
    default: 99
  },
  fixedDecimals: {
    type: Number,
    required: false,
    default: 0
  },
  showBorder: {
    type: Boolean,
    required: false,
    default: true
  },
  width: {
    type: Number,
    required: false
  }
});

const dragging = ref(false);
const DRAG_RANGE = 90; // todo: responsive?
let prevY = -1;

const triangleColor = computed(() => {
  return dragging.value ? theme.colors.primary : theme.colors.secondary;
});

const cssVars = computed(() => {
  return {
    '--border-color': `${theme.colors.secondary}`,
    '--numbox-width': props.width ? `${props.width}px` : 'auto'
  };
});

const valueRange = computed(() => {
  return props.maxValue - props.minValue;
});

// todo: allow user to manually type value
function onDoubleClick() {
  emit('update:modelValue', 0);
}

// todo: could refactor dragging logic into composable and share with knob, fader, etc.
function onMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  document.addEventListener("mousemove", onNumBoxMouseDrag);
  document.addEventListener("touchmove", onNumBoxTouchDrag);
  document.addEventListener("mouseup", onDocumentMouseUp);
  document.addEventListener("touchend", onDocumentMouseUp);
}

function onDocumentMouseUp() {
  document.removeEventListener("mousemove", onNumBoxMouseDrag);
  document.removeEventListener("touchmove", onNumBoxTouchDrag);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  document.removeEventListener("touchend", onDocumentMouseUp);
  prevY = -1;
}

function onNumBoxDrag(currY: number) {
  if (prevY >= 0) {
    const diffY = prevY - currY;
    const value = clamp(
      props.modelValue + (diffY / DRAG_RANGE) * (valueRange.value / 2),
      props.minValue,
      props.maxValue
    );

    emit("update:modelValue", round(value, props.fixedDecimals));
  }
}

function onNumBoxTouchDrag(e: TouchEvent) {
  if (e.touches[0]) {
    onNumBoxDrag(e.touches[0].pageY);
    prevY = e.touches[0].pageY;
  }
}

function onNumBoxMouseDrag(e: MouseEvent) {
  onNumBoxDrag(e.pageY);
  prevY = e.pageY;
}

</script>

<style scoped>
.numbox {
  display: flex;
  align-items: center;
  gap: 0.2em;
  min-width: 3ch;
  padding: 0.2em 0.4em 0.2em 0.3em;
  user-select: none;
  width: var(--numbox-width);
}

.numbox.show-border {
  border: 1px solid var(--border-color);
}

.numbox:hover {
  cursor: pointer;
}

.num-trianlge {
  flex: 0 0 auto;        /* natural width */
}

.num-value {
  flex: 1 1 auto;        /* take remaining space */
  min-width: 0;          /* IMPORTANT: allows shrinking */
  overflow: hidden;
  white-space: nowrap;  /* optional */
  text-overflow: ellipsis; /* optional */
}

</style>