<template>
  <div class="meter-container">
    <svg
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
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, onMounted, onUnmounted } from "vue";
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

    const {
      getPeakDb,
      getRmsDb,
      getFloatTimeDomainData,
      analyzer
    } = useMetering(input.context, props.fftSize);

    const { startRendering, stopRendering } = useRendering();

    const value = ref(-1);
    const color = ref("black");

    const rotation = computed(() => {
      return isNaN(value.value)
        ? "rotate(0 100.64 163)"
        : `rotate(${50 * value.value} 100.64 163)`;
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
      value
    };
  }
});
</script>

<style scoped>
.meter-container {
  /* background: white; */
  display: inline-block;
  background-color: white;
  padding: 8px;
  border: 1px solid gray;
}
</style>