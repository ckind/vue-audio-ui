<template>
  <canvas
    ref="analyserCanvas"
    :height="graphHeight"
    :width="width"
    class="analyser-canvas"
  >
  </canvas>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted, watch, computed } from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { isPowerOfTwo } from "@/util/math-helpers";
import theme from "@/theme.ts";

const DEFAULT_ASPECT_RATIO = 3;

const props = defineProps({
  input: {
    type: Object, // type: AudioNode -- need to use Object for SSR
    required: false,
  },
  width: {
    type: Number,
    required: false,
    default: 500,
  },
  height: {
    type: Number,
    required: false,
  },
  fftSize: {
    type: Number,
    required: false,
    default: 2048,
    validator(n: number) {
      return n >= 32 && n <= 32768 && isPowerOfTwo(n);
    },
  },
  lineColor: {
    type: String,
    required: false,
  },
});

const metering = useMetering(
  props.fftSize,
  props.input as AudioNode | undefined
);
const rendering = useRendering();

watch(
  () => props.input,
  (newVal, oldVal) => {
    metering.onInputChanged(
      newVal as AudioNode | undefined,
      oldVal as AudioNode | undefined
    );
  }
);

const analyserCanvas = useTemplateRef("analyserCanvas");
let canvasContext: CanvasRenderingContext2D;

onMounted(() => {
  canvasContext = analyserCanvas.value?.getContext("2d")!;
  rendering.startRendering(drawTimeDomain);
});

onUnmounted(dispose);

const graphHeight = computed(() => {
  return props.height ? props.height : props.width / DEFAULT_ASPECT_RATIO;
});

function dispose() {
  metering.disposeMetering(props.input as AudioNode | undefined);
}

function drawTimeDomain() {
  let dataArray = metering.getFloatTimeDomainData();

  // console.log(dataArray);

  if (!canvasContext) return;

  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, props.width, graphHeight.value);

  if (!dataArray) return;

  canvasContext.lineWidth = 2.5;
  canvasContext.strokeStyle = props.lineColor ?? theme.colors.primary;

  canvasContext.beginPath();

  const sliceWidth = props.width / dataArray.length;

  let x = 0;
  let y = 0;

  for (let i = 0; i < dataArray.length; i++) {
    // todo: allow props input for min and max (default to -1 and 1)

    // dataArray[i] is a float between -1 and 1
    // flip the phase because canvas y coordinates are top-down
    const v = (-dataArray[i]! * graphHeight.value) / 2;
    y = graphHeight.value / 2 + v;

    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasContext.lineTo(props.width, y);
  canvasContext.stroke();
}
</script>
