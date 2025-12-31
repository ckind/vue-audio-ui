<template>
  <div class="control-container">
    <div class="knob-row">
      <!-- default knob -->
      <span
        @mousedown="onKnobMouseDown"
        @touchstart="onKnobMouseDown"
        @dblclick="onKnobDblClick"
        class="knob-container"
        :style="`transform: rotate(${knobRotation}rad); width: ${size}px; height: ${size}px;`"
      >
        <slot>
          <default-knob />
        </slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, computed, watch, ref } from "vue";
import { LinearCurvedRange } from "@/util/curved-range.ts";
import { clamp } from "@/util/math-helpers.ts";
import defaultKnob from "@/lib/components/default-knob.vue";
import { type PropType } from "vue";

// type CurveType = "linear" | "exp";
// type KnobModelValueType = number | AudioParam;

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    required: true,
    type: Number,
  },
  minValue: {
    required: true,
    type: Number,
  },
  maxValue: {
    required: true,
    type: Number,
  },
  step: {
    required: false,
    type: Number,
    default: 0,
  },
  size: {
    required: false,
    type: Number,
    default: 60,
  },
  default: {
    required: false,
    type: Number,
  },
});

const knobRotation = computed<number>(() => {
  const offset = linearValue.value - midValue.value;
  return (offset / (valueRange.value / 2)) * rotationMax.value;
});

const midValue = computed<number>(() => {
  return props.minValue + valueRange.value / 2;
});

const valueRange = computed<number>(() => {
  return props.maxValue - props.minValue;
});

const rotationMax = ref((3 * Math.PI) / 4);
const dragRange = ref(70);
const prevY = ref(-1);
const valueCurve = ref(new LinearCurvedRange(props.minValue, props.maxValue));
const linearValue = ref(props.modelValue);
const curvedValue = ref(valueCurve.value.getCurvedValue(linearValue.value));
const unsteppedValue = ref(curvedValue.value);
// const audioParamValue = ref<AudioParam | null>(null); // todo: allow AudioParam input

function onKnobMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  document.addEventListener("mousemove", onKnobMouseDrag);
  document.addEventListener("touchmove", onKnobTouchDrag);
  document.addEventListener("mouseup", onDocumentMouseUp);
  document.addEventListener("touchend", onDocumentMouseUp);
}

function onDocumentMouseUp() {
  document.removeEventListener("mousemove", onKnobMouseDrag);
  document.removeEventListener("touchmove", onKnobTouchDrag);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  document.removeEventListener("touchend", onDocumentMouseUp);
  prevY.value = -1;
}
function onKnobDblClick() {
  const value =
    typeof props.default === "undefined" ? midValue.value : props.default;
  unsteppedValue.value = value;
  emit("update:modelValue", valueCurve.value.getCurvedValue(value));
}

function roundToStep(x: number) {
  if (props.step === 0) {
    throw "step is zero or undefined";
  }
  const roundedValue = Math.round(x / props.step) * props.step;

  return clamp(roundedValue, props.minValue, props.maxValue);
}

function onKnobDrag(currY: number) {
  if (prevY.value >= 0) {
    const diffY = prevY.value - currY;
    let knobValue =
      unsteppedValue.value + (diffY / dragRange.value) * (valueRange.value / 2);
    knobValue = clamp(knobValue, props.minValue, props.maxValue);

    unsteppedValue.value = knobValue;
    const steppedValue =
      props.step === 0
        ? unsteppedValue.value
        : roundToStep(unsteppedValue.value);
    emit("update:modelValue", valueCurve.value.getCurvedValue(steppedValue));
  }
}

function onKnobTouchDrag(e: TouchEvent) {
  if (e.touches[0]) {
    onKnobDrag(e.touches[0].pageY);
    prevY.value = e.touches[0].pageY;
  }
}

function onKnobMouseDrag(e: MouseEvent) {
  onKnobDrag(e.pageY);
  prevY.value = e.pageY;
}

watch(
  () => props.modelValue,
  (newValue: number, oldValue: number) => {
    curvedValue.value = newValue;
    unsteppedValue.value = valueCurve.value.getLinearValue(curvedValue.value);
    linearValue.value =
      props.step === 0
        ? unsteppedValue.value
        : roundToStep(unsteppedValue.value);
  }
);
</script>

<style scoped>
.knob-row {
  justify-content: center;
  display: flex;
}

.knob-shadow {
  -webkit-box-shadow: 0px 0px 8px var(--shadowColor);
  box-shadow: 0px 0px 8px var(--shadowColor);
}

.knob-container {
  border-radius: 50%;
  line-height: 0px !important;
  cursor: move;
}

.knob-container ::v-deep svg {
  /* This makes the SVG fill the container */
  width: 100% !important;
  height: auto !important;
  /* Ensures the aspect ratio is preserved */
  display: block;
  /* Removes default inline spacing issues */
}

.knob-container ::v-deep img {
  /* This makes the SVG fill the container */
  width: 100% !important;
  height: auto !important;
  /* Ensures the aspect ratio is preserved */
  display: block;
  /* Removes default inline spacing issues */
}

.control-container {
  display: inline-block;
}
</style>
