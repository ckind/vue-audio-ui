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
import { round, fitToBounds } from '@/util/math-helpers.ts';

const props = defineProps({
  // todo: needs to be a number if no valueList is provided
  modelValue: {
    required: true
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
  valueList: {
    type: Array<any>,
    required: false
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

const emit = defineEmits(['update:modelValue']);
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
  if (props.valueList) {
    return props.valueList.length - 1;
  }

  return props.maxValue - props.minValue;
});

function onDoubleClick() {
  emit('update:modelValue', 0);
}

function onMouseDown(event: MouseEvent) {
  dragging.value = true;
  event.preventDefault();
  const startY = event.clientY;
  const startValue = props.modelValue;

  function onMouseMove(e: MouseEvent) {
    const dragRange = window.innerHeight / 2;
    const deltaY = startY - e.clientY;

    if (props.valueList) {
      let i = Math.round(
        props.valueList.indexOf(props.modelValue)
          + (deltaY / dragRange) * (valueRange.value / 2));
      i = fitToBounds(i, 0, props.valueList.length - 1);
      emit('update:modelValue', props.valueList[i]);
    } else if (typeof props.modelValue === 'number') {
      const newValue = fitToBounds(
        props.modelValue + (deltaY / dragRange) * (valueRange.value / 2),
        props.minValue,
        props.maxValue
      );
      emit('update:modelValue', round(newValue, props.fixedDecimals));
    }
  }

  function onMouseUp() {
    dragging.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
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