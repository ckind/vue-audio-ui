<template>
  <div ref="faderContainer" class="v-a-fader-container" :style="cssVars">
    <div ref="faderBackground" :class="['fader-background', props.orientation]">
      <slot name="faderBackground">
        <defaultFaderBackground />
      </slot>
    </div>
    <div
      ref="faderHead"
      :class="['fader-head', props.orientation]"
      @mousedown="onDragElementStart"
      @touchstart="onDragElementStart"
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
  ref,
  useTemplateRef,
  computed,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
} from "vue";
import defaultFaderHead from "@/lib/components/default-fader-head.vue";
import defaultFaderBackground from "./components/default-fader-background.vue";
import { LinearCurvedRange } from "@/util/curved-range";
import { clamp } from "@/util/math-helpers.ts";
import useDragging from "@/composables/useDragging";

export type FaderOrientationType = "vertical" | "horizontal";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    required: true,
    type: Number,
  },
  input: {
    required: false,
    type: Object as PropType<AudioParam | undefined>,
    default: undefined,
  },
  audioContext: {
    required: false,
    type: Object as PropType<AudioContext | undefined>,
    default: undefined,
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
  orientation: {
    required: false,
    type: String as PropType<FaderOrientationType>,
    default: "vertical",
  },
});

const valueCurve = ref(new LinearCurvedRange(props.minValue, props.maxValue));
const linearValue = ref(props.modelValue);
const curvedValue = ref(valueCurve.value.getCurvedValue(props.modelValue));
const faderHead = useTemplateRef("faderHead");
const faderHeadHeight = ref(0);
const faderHeadWidth = ref(0);
const resizeObserver = ref<ResizeObserver | undefined>(undefined); // todo: does this need to be a ref?

const faderHeight = computed(() => {
  // return props.orientation === "horizontal" ? props.width : props.height;
  return props.height;
});

const faderWidth = computed(() => {
  // return props.orientation === "horizontal" ? props.height : props.width;
  return props.width;
});

const valueRange = computed(() => {
  return props.maxValue - props.minValue;
});

const midValue = computed(() => {
  return props.minValue + valueRange.value / 2;
});

const faderDragRange = computed(() => {
  if (props.orientation === "horizontal") {
    return Math.abs(faderWidth.value - faderHeadWidth.value);
  }

  return Math.abs(faderHeight.value - faderHeadHeight.value);
});

const faderHeadTop = computed(() => {
  // set top position prop of fader head based on value of control
  // need to invert so highest value is top: 0
  const valueRatio = (linearValue.value - props.minValue) / valueRange.value;
  return faderDragRange.value - valueRatio * faderDragRange.value;
});

const faderHeadLeft = computed(() => {
  // set left position prop of fader head based on value of control
  const valueRatio = (linearValue.value - props.minValue) / valueRange.value;
  return valueRatio * faderDragRange.value;
});

const cssVars = computed(() => {
  return {
    "--fader-height": `${faderHeight.value}px`,
    "--fader-width": `${faderWidth.value}px`,
    "--fader-head-top": `${faderHeadTop.value}px`,
    "--fader-head-left": `${faderHeadLeft.value}px`,
  };
});

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

function getFaderHeadSize() {
  if (!faderHead.value) return { height: 0, width: 0 };

  // look for underlying img or svg to get exact height
  // todo: could probably just get the container height
  // to match the img or svg height exactly with proper css
  const headImg = getContainedImgOrSvg(faderHead.value as HTMLElement);

  return headImg
    ? {
        height: headImg.getBoundingClientRect().height,
        width: headImg.getBoundingClientRect().width,
      }
    : {
        height: faderHead.value.getBoundingClientRect().height,
        width: faderHead.value.getBoundingClientRect().width,
      };
}

function onHeadDblClick() {
  const value =
    typeof props.default === "undefined" ? midValue.value : props.default;

  if (props.input && props.audioContext) {
    props.input.linearRampToValueAtTime(
      value,
      props.audioContext.currentTime + 0.01
    );
  }

  emit("update:modelValue", valueCurve.value.getCurvedValue(value));
}

function onHeadDrag(deltaX: number, deltaY: number) {
  const delta = props.orientation === "horizontal" ? deltaX : -deltaY;

  const faderValue = clamp(
    linearValue.value + (delta / faderDragRange.value) * valueRange.value,
    props.minValue,
    props.maxValue
  );

  if (props.input && props.audioContext) {
    props.input.linearRampToValueAtTime(
      faderValue,
      props.audioContext.currentTime + 0.01
    );
  }

  emit("update:modelValue", valueCurve.value.getCurvedValue(faderValue));
}

const { onDragElementStart, dragging } = useDragging(onHeadDrag);

onMounted(() => {
  resizeObserver.value = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      const size = getFaderHeadSize();
      faderHeadWidth.value = size.width;
      faderHeadHeight.value = size.height;
    }
  );

  resizeObserver.value.observe(faderHead.value as HTMLElement);
});

onUnmounted(() => {
  resizeObserver.value?.disconnect();
});
</script>

<style scoped>
.v-a-fader-container {
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
.fader-head.vertical {
  top: var(--fader-head-top);
  left: 50%;
  translate: -50% 0;
}
.fader-head.horizontal {
  left: var(--fader-head-left);
  top: 50%;
  transform: rotate(90deg) translateY(-100%) translateX(-50%);
  transform-origin: top left;
}

.fader-background {
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
.fader-background.vertical {
  width: var(--fader-width);
  height: var(--fader-height);
}
.fader-background.horizontal {
  /* need to flip height and width since we're rotating 90 degrees */
  height: var(--fader-width);
  width: var(--fader-height);
  transform: rotate(90deg) translateY(-100%);
  transform-origin: top left;
  /* transform: rotate(90deg); */
}
</style>
