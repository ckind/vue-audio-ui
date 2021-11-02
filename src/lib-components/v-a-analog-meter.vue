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
import { defineComponent, PropType } from "vue";
import useMetering from "@/composables/metering";
import useRendering from "@/composables/rendering";
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

    return {
      ...useMetering(input.context, props.fftSize),
      ...useRendering(),
    };
  },
  computed: {
    rotation() {
      return isNaN(this.value)
        ? "rotate(0 100.64 163)"
        : `rotate(${50 * this.value} 100.64 163)`;
    },
  },
  data() {
    return {
      value: -1,
      continueDrawing: false,
      color: "black",
    };
  },
  created() {
    this.input.connect(this.analyzer);
  },
  mounted() {
    this.startRendering(this.draw);
  },
  methods: {
    
    draw(): void {
      const dataArray = this.getFloatTimeDomainData();

      let db = 0;

      if (this.type === "peak") {
        db = this.getPeakDb(dataArray);
      } else if (this.type === "rms") {
        db = this.getRmsDb(dataArray);
      }

      const dbRange = 80;
      db = db < -dbRange ? -dbRange : db;
      const mult = (dbRange + db) / dbRange;

      this.value = mult * 2 - 1;
    },
  },
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