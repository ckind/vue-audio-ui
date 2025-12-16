<template>
  <div class="meter-container">
    <!-- <svg
      :width="`${this.width}px`"
      version="1.1"
      viewBox="0 0 88.598 57.562"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform="translate(-56.435 -110.51)"
        stroke="#000"
        stroke-linecap="round"
      >
        <path
          d="m100.67 162.95 0.0615-45.323m4.5398 45.537a4.5436 4.5436 0 0 1-4.5525 4.5348 4.5436 4.5436 0 0 1-4.5346-4.5525 4.5436 4.5436 0 0 1 4.5525-4.5347 4.5436 4.5436 0 0 1 4.5347 4.5524z"
          :fill="color"
          :stroke="color"
          stroke-width="1"
          style="paint-order: fill markers stroke"
          :transform="rotation"
        />
        <path
          transform="translate(0 0)"
          d="m56.768 117.96c46.869-16.022 87.933-6e-3 87.933-6e-3"
          fill="none"
          :stroke="color"
          stroke-width="1"
        />
      </g>
    </svg> -->

    <svg
      :width="`${this.width}px`"
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Metal frame -->
        <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f0f0f0" />
          <stop offset="50%" stop-color="#b5b5b5" />
          <stop offset="100%" stop-color="#8a8a8a" />
        </linearGradient>

        <!-- Face background -->
        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fffdf7" />
          <stop offset="100%" stop-color="#e9e2d3" />
        </linearGradient>

        <!-- Glass highlight -->
        <radialGradient id="glassGrad" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stop-color="white" stop-opacity="0.7" />
          <stop offset="60%" stop-color="white" stop-opacity="0.15" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>

        <!-- Shadow -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4" />
        </filter>

        <!-- Needle shadow -->
        <filter id="needleShadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5" />
        </filter>
      </defs>

      <!-- Frame -->
      <rect
        x="10"
        y="10"
        rx="18"
        ry="18"
        width="300"
        height="200"
        fill="url(#frameGrad)" z
        filter="url(#shadow)"
      />

      <!-- Inner face -->
      <rect
        x="24"
        y="24"
        rx="12"
        ry="12"
        width="272"
        height="172"
        fill="url(#faceGrad)"
        stroke="#777"
        stroke-width="1"
      />

      <!-- Scale arc -->
      <path
        d="M 60 90 A 130 70 0 0 1 260 90"
        fill="none"
        stroke="#222"
        stroke-width="2"
      />

      <!-- Tick marks -->
      <g stroke="#222" stroke-width="2">
        <line x1="100" y1="120" x2="105" y2="130" />
        <line x1="160" y1="110" x2="160" y2="122" />
        <line x1="220" y1="120" x2="215" y2="130" />
      </g>

      <!-- Labels todo: -->
      <!-- <g font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#111">
        <text x="55" y="165">-20</text>
        <text x="95" y="115">-10</text>
        <text x="150" y="105">0</text>
        <text x="205" y="115">+3</text>
        <text x="245" y="165">+6</text>
      </g> -->

      <!-- Needle -->
      <g
        id="needle"
        :transform="rotation"
     
      >
        <polygon points="160,70 158,150 162,150" fill="#c62828" />
        <circle cx="160" cy="150" r="6" fill="#333" />
        <circle cx="160" cy="150" r="3" fill="#777" />
      </g>

      <!-- Glass overlay -->
      <rect
        x="24"
        y="24"
        rx="12"
        ry="12"
        width="272"
        height="172"
        fill="url(#glassGrad)"
      />

      <!-- VU text -->
      <text
        x="160"
        y="185"
        text-anchor="middle"
        font-size="16"
        font-weight="bold"
        font-family="Arial, Helvetica, sans-serif"
        fill="#333"
      >
        <!-- VU -->
      </text>
    </svg>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  onMounted,
  onUnmounted,
} from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { AnalogMeterType } from "@/types/v-audio-ui-types";

export default defineComponent({
  name: "VAAnalogMeter",
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
    type: {
      required: false,
      type: String as PropType<AnalogMeterType>,
      default: "peak",
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048,
    },
    width: {
      required: false,
      type: Number,
      default: 300,
    },
  },
  setup(props) {
    const input = props.input as AudioNode;

    const { getPeakDb, getRmsDb, getFloatTimeDomainData, analyzer } =
      useMetering(input.context, props.fftSize);

    const { startRendering, stopRendering } = useRendering();

    const value = ref(-1);
    const color = ref("black");

    const rotation = computed(() => {
      return isNaN(value.value)
        ? "rotate(0 160 150)"
        : `rotate(${50 * value.value} 160 150)`;
    });

    onMounted(() => {
      startRendering(() => {
        const dataArray = getFloatTimeDomainData();

        let db = 0;

        if (props.type === "peak") {
          db = getPeakDb(dataArray);
        } else if (props.type === "rms") {
          db = getRmsDb(dataArray);
        }

        const dbRange = 80;
        db = db < -dbRange ? -dbRange : db;
        const mult = (dbRange + db) / dbRange;

        value.value = mult * 2 - 1;
      });
    });

    onUnmounted(() => {
      stopRendering();
    });

    input.connect(analyzer);

    return {
      color,
      rotation,
      value,
    };
  },
});
</script>

<style scoped>
.meter-container {
  /* background: white; */
  display: inline-block;
  /* background-color: white;
  border: 1px solid gray; */
}
</style>