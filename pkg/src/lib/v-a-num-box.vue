<template>
  <div
    ref="numBox"
    class="numbox"
    :style="cssVars"
    :class="{ 'show-border': showBorder }"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
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

    <span v-if="!manualInput" class="num-value">{{ modelValue }}</span>
    <input
      v-if="manualInput"
      id="manualInputEl"
      ref="manualInputEl"
      type="number"
      :min="minValue"
      :max="maxValue"
      v-model="manualInputValue"
      @keydown="onManualInputKeyDown"
    ></input> 
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef, nextTick } from 'vue';
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
const manualInput = ref(false);
const manualInputValue = ref<number>(props.modelValue);
const manualInputEl = useTemplateRef('manualInputEl');
const numBox = useTemplateRef('numBox');
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

watch(() => props.modelValue, (val) => manualInputValue.value = val);

function onDoubleClick() {
  manualInput.value = true;
  manualInputValue.value = props.modelValue;

  nextTick().then(() => {
    manualInputEl.value?.select();
    document.addEventListener('mouseup', onManualInputDocumentMouseUp);
  });
}

function onManualInputDocumentMouseUp(e: MouseEvent) {
  // commit manual input changes if use clicks outside of num box
  if (!numBox.value!.contains(e.target as Node)) {
    commitManualInput();
  }
}

function onManualInputKeyDown(e: KeyboardEvent) {
  // commit manual input changes if use presses enter
  if (e.key === 'Enter') {
    commitManualInput();
  }
}

function commitManualInput() {
  emit("update:modelValue",
    clamp(
      round(manualInputValue.value, props.fixedDecimals),
      props.minValue,
      props.maxValue
    )
  );
  manualInput.value = false;
  document.removeEventListener('mouseup', onManualInputDocumentMouseUp);
}

// todo: could refactor dragging logic into composable and share with knob, fader, etc.
function onMouseDown(e: MouseEvent | TouchEvent) {
  if (!manualInput.value) {
    e.preventDefault();
    document.addEventListener("mousemove", onNumBoxMouseDrag);
    document.addEventListener("touchmove", onNumBoxTouchDrag);
    document.addEventListener("mouseup", onDocumentMouseUp);
    document.addEventListener("touchend", onDocumentMouseUp);
  } 
}

function onDocumentMouseUp() {
  dragging.value = false;
  document.removeEventListener("mousemove", onNumBoxMouseDrag);
  document.removeEventListener("touchmove", onNumBoxTouchDrag);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  document.removeEventListener("touchend", onDocumentMouseUp);
  prevY = -1;
}

function onNumBoxDrag(currY: number) {
  dragging.value = true;
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

input[type="number"] {
  font-family: inherit;
  font-size: inherit;
  /* You may also want to set the width to a specific value if needed */
}

</style>