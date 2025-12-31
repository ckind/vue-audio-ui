<template>
  <div ref="faderContainer" class="fader-container" :style="cssVars">
    <div ref="faderBackground" class="fader-background">
      <slot name="faderBackground">
        <defaultFaderBackground />
      </slot>
    </div>
    <div
      ref="faderHead"
      class="fader-head"
      @mousedown="onHeadMouseDown"
      @touchstart="onHeadMouseDown"
      @dblclick="onHeadDblClick"
    >
      <slot name="faderHead">
        <defaultFaderHead />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  defineComponent,
  ref,
  useTemplateRef,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import defaultFaderHead from "@/lib/components/default-fader-head.vue";
import defaultFaderBackground from "./components/default-fader-background.vue";
import { LinearCurvedRange } from "@/util/curved-range";

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
  height: {
    required: false,
    type: Number,
    default: 200,
  },
  width: {
    required: false,
    type: Number,
    default: 46,
  },
  default: {
    required: false,
    type: Number,
  },
});

const valueCurve = ref(new LinearCurvedRange(props.minValue, props.maxValue));
const faderContainerY = ref(0);
const linearValue = ref(props.modelValue);
const curvedValue = ref(valueCurve.value.getCurvedValue(props.modelValue));

const faderContainer = useTemplateRef("faderContainer");
const faderBackground = useTemplateRef("faderBackground");
const faderHead = useTemplateRef("faderHead");
const faderHeadHeight = ref(0);
// todo: does this need to be a ref?
const resizeObserver = ref<ResizeObserver | undefined>(undefined);
const valueRange = computed(() => {
  return props.maxValue - props.minValue;
});

const midValue = computed(() => {
  return props.minValue + valueRange.value / 2;
});

const faderDragRange = computed(() => {
  return Math.abs(props.height - faderHeadHeight.value);
});

const faderHeadTop = computed(() => {
  // set top position prop of fader head based on value of control
  // need to invert so highest value is top: 0
  const valueRatio = (linearValue.value - props.minValue) / valueRange.value;
  return faderDragRange.value - valueRatio * faderDragRange.value;
});

const cssVars = computed(() => {
  return {
    "--fader-height": `${props.height}px`,
    "--fader-width": `${props.width}px`,
    "--fader-head-top": `${faderHeadTop.value}px`,
  };
});

onMounted(() => {
  resizeObserver.value = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      faderHeadHeight.value = getFaderHeadHeight();
    }
  );

  resizeObserver.value.observe(faderHead.value as HTMLElement);
});

onUnmounted(() => {
  resizeObserver.value?.disconnect();
});

function getContainedImgOrSvg(el: HTMLElement) {
  if (el.children.length == 1) {
    if (el.children.item(0) instanceof SVGElement) {
      return el.children.item(0);
    } else if (el.children.item(0) instanceof HTMLImageElement) {
      return el.children.item(0);
    }
  }

  return undefined;
}

function getFaderHeadHeight() {
  if (!faderHead.value) return 0;

  // look for underlying img or svg to get exact height
  // todo: could probably just get the container height
  // to match the img or svg height exactly with proper css
  const headImg = getContainedImgOrSvg(faderHead.value as HTMLElement);

  return headImg
    ? headImg.getBoundingClientRect().height
    : faderHead.value.getBoundingClientRect().height;
}

function onHeadMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault();

  faderContainerY.value = (
    faderContainer.value as HTMLElement
  ).getBoundingClientRect().y;

  faderHeadHeight.value = getFaderHeadHeight();
  document.addEventListener("mousemove", onHeadMouseDrag);
  document.addEventListener("touchmove", onHeadTouchDrag);
  document.addEventListener("mouseup", onDocumentMouseUp);
  document.addEventListener("touchend", onDocumentMouseUp);
}
function onDocumentMouseUp() {
  document.removeEventListener("mousemove", onHeadMouseDrag);
  document.removeEventListener("touchmove", onHeadTouchDrag);
  document.removeEventListener("mouseup", onDocumentMouseUp);
  document.removeEventListener("touchend", onDocumentMouseUp);
}

function onHeadDblClick() {
  const value =
    typeof props.default === "undefined" ? midValue.value : props.default;
  emit("update:modelValue", valueCurve.value.getCurvedValue(value));
}
function onHeadDrag(currPageY: number) {
  let currSvgY = currPageY - faderContainerY.value;

  if (currSvgY > props.height) {
    currSvgY = props.height;
  } else if (currSvgY < 0) {
    currSvgY = 0;
  }

  const mult = (props.height - currSvgY) / props.height;
  const faderValue = mult * valueRange.value + props.minValue;

  emit("update:modelValue", valueCurve.value.getCurvedValue(faderValue));
}
function onHeadTouchDrag(e: TouchEvent) {
  if (e.touches[0]) onHeadDrag(e.touches[0].clientY);
}
function onHeadMouseDrag(e: MouseEvent) {
  onHeadDrag(e.clientY);
}

watch(
  () => props.modelValue,
  (newValue: number) => {
    curvedValue.value = newValue;
    linearValue.value = valueCurve.value.getLinearValue(curvedValue.value);
  }
);

watch(
  () => props.minValue,
  (newValue: number) => {
    valueCurve.value = new LinearCurvedRange(newValue, props.maxValue);
  }
);

watch(
  () => props.maxValue,
  (newValue: number) => {
    valueCurve.value = new LinearCurvedRange(props.minValue, newValue);
  }
);
</script>

<style scoped>
.fader-container {
  width: var(--fader-width);
  height: var(--fader-height);
  position: relative;
  /* display: inline-block; */
}

.fader-head {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
  cursor: move;
  position: absolute;
  top: var(--fader-head-top);
  left: 50%;
  translate: -50% 0;
}

.fader-head ::v-deep img {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
  display: block;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}

.fader-head ::v-deep svg {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
}

.fader-background {
  width: var(--fader-width);
  height: var(--fader-height);
  position: absolute;
}

.fader-background ::v-deep img {
  width: 100% !important;
  height: 100% !important;
  display: block;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}

.fader-background ::v-deep svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.spacer {
  width: var(--fader-width);
  height: var(--fader-height);
  visibility: hidden;
}
</style>
