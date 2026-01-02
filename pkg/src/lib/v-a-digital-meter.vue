<template>
  <div class="meter-container">
    <canvas
      class="meter"
      ref="meterCanvas"
      :height="height"
      :width="canvasWidth"
    />
    <div class="db-markers" v-if="drawMarkers">
      <div
        class="db-marker"
        v-for="(db, i) in dbMarkerValues"
        :key="i"
        :style="{
          height:
            getDbMarkerHeight(db, i > 0 ? dbMarkerValues[i - 1] : undefined) +
            'px',
          color: dbMarkerColor,
        }"
      >
        <span class="db-dash">-</span>{{ Math.abs(db) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type PropType,
  watch,
  computed,
  ref,
  onMounted,
  onUnmounted,
  useTemplateRef,
} from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { type DigitalMeterType } from "@/types/vue-audio-ui-types";
import { LogCurvedRange } from "@/util/curved-range.ts";
import { clamp } from "@/util/math-helpers.ts";
import theme from "@/theme.ts";

const DB_RANGE = 90;
const DB_PADDING_TOP = 10;
const curve = new LogCurvedRange(0, DB_RANGE, 2);

const props = defineProps({
  input: {
    required: false,
    type: Object as PropType<AudioNode | undefined>, // type: AudioNode -- need to use Object for SSR
    default: undefined,
  },
  type: {
    required: false,
    type: String as PropType<DigitalMeterType>,
    default: "peak",
  },
  fftSize: {
    required: false,
    type: Number,
    default: 2048,
  },
  clippingColor: {
    required: false,
    type: String,
  },
  barColor: {
    required: false,
    type: String,
  },
  backgroundColor: {
    required: false,
    type: String,
  },
  markerColor: {
    required: false,
    type: String,
  },
  drawMarkers: {
    required: false,
    type: Boolean,
    default: false,
  },
  height: {
    required: false,
    type: Number,
    default: 200,
  },
  width: {
    required: false,
    type: Number,
    default: 20,
  },
});

const canvasCtx = ref<CanvasRenderingContext2D | null>(null);
const dbMarkerValues = ref([0, -10, -20, -30, -40, -60]);
const meterCanvas = useTemplateRef("meterCanvas");

const dbMarkerColor = computed(() => {
  return props.markerColor ?? theme.colors.muted;
});
const canvasWidth = computed(() => {
  return props.width;
});

const {
  getPeakDb,
  getRmsDb,
  getFloatTimeDomainData,
  onInputChanged,
  disposeMetering,
} = useMetering(props.fftSize, props.input as AudioNode);
const { startRendering, stopRendering } = useRendering();

watch(
  () => props.input,
  (newVal, oldVal) => {
    onInputChanged(
      newVal as AudioNode | undefined,
      oldVal as AudioNode | undefined
    );
  }
);

onMounted(() => {
  const canvas = meterCanvas.value as HTMLCanvasElement;
  canvasCtx.value = canvas.getContext("2d");
  startRendering(draw);
});

onUnmounted(() => {
  disposeMetering(props.input as AudioNode);
  stopRendering();
});

function getDbMarkerHeight(db: number, previousDb?: number) {
  // for top marker, calculate total height from top
  if (previousDb === undefined) {
    return props.height - getMeterHeight(scaleY(db));
  }

  // else calculate height difference from previous marker
  const y = props.height - getMeterHeight(scaleY(db));
  const prevY = props.height - getMeterHeight(scaleY(previousDb));
  return y - prevY;
}

// convert dB to height from the bottom of the graph in pixels
function getMeterHeight(db: number) {
  return (
    props.height *
    ((DB_RANGE + db) / DB_RANGE) *
    (DB_RANGE / (DB_RANGE + DB_PADDING_TOP))
  );
}

function scaleY(db: number): number {
  return curve.getCurvedValue(db + DB_RANGE) - DB_RANGE;
}

function draw(): void {
  if (canvasCtx.value) {
    const dataArray = getFloatTimeDomainData();

    let db = -DB_RANGE;

    if (props.type === "peak" && dataArray) {
      db = getPeakDb(dataArray);
    } else if (props.type === "rms" && dataArray) {
      db = getRmsDb(dataArray);
    }

    const clipping = db > 0;
    db = clamp(db, -DB_RANGE, 0);

    const meterHeight = getMeterHeight(scaleY(db));

    canvasCtx.value.clearRect(0, 0, canvasWidth.value, props.height);

    canvasCtx.value.fillStyle = props.backgroundColor ?? theme.colors.light;
    canvasCtx.value.beginPath();
    canvasCtx.value.fillRect(0, 0, props.width, props.height);
    canvasCtx.value.stroke();

    canvasCtx.value.fillStyle = clipping
      ? props.clippingColor ?? theme.colors.danger
      : props.barColor ?? theme.colors.success;
    canvasCtx.value.beginPath();
    canvasCtx.value.fillRect(
      0,
      props.height - meterHeight,
      props.width,
      meterHeight
    );
    canvasCtx.value.stroke();
  }
}
</script>

<style scoped>
.meter-container {
  display: flex;
  justify-content: center;
  position: relative;
}
.db-markers {
  display: flex;
  flex-direction: column;
}
.db-marker {
  display: flex;
  align-items: center;
  transform: translateY(
    calc(50% - 0.1em)
  ); /* shift the element down to center it on the exact db value */
  font-size: 0.6em;
}
.db-dash {
  padding-left: 4px;
  padding-right: 4px;
}
</style>
