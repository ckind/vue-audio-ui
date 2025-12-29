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
          height: getDbMarkerHeight(db, i > 0 ? dbMarkerValues[i - 1] : undefined) + 'px', 
          color: dbMarkerColor
        }"
      >
        <span class="db-dash">-</span>{{ Math.abs(db) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, watch } from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { type DigitalMeterType } from "@/types/vue-audio-ui-types";
import { LogCurvedRange } from "@/util/curved-range.ts"
import { clamp } from "@/util/math-helpers.ts";
import theme from '@/theme.ts';

const DB_RANGE = 90;
const DB_PADDING_TOP = 10;
const curve = new LogCurvedRange(0, DB_RANGE, 2);

export default defineComponent({
  name: "VADigitalMeter",
  props: {
    input: {
      required: false,
      type: Object, // type: AudioNode -- need to use Object for SSR
      default: undefined
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
      type: String
    },
    markerColor: {
      required: false,
      type: String
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
    }
  },
  computed: {
    dbMarkerColor(): string {
      return this.markerColor ?? theme.colors.muted;
    },
    canvasWidth(): number {
      return this.width;
    },
  },
  setup(props) {
    const metering = useMetering(props.fftSize, props.input as AudioNode);

    watch(() => props.input, (newVal, oldVal) => {
      metering.onInputChanged(newVal as AudioNode | undefined, oldVal as AudioNode | undefined);
    });

    return {
      ...metering,
      ...useRendering()
    };
  },
  data() {
    return {
      canvasCxt: null as CanvasRenderingContext2D | null,
      dbMarkerValues: [0, -10, -20, -30, -40, -60]
    };
  },
  mounted() {
    const canvas = this.$refs.meterCanvas as HTMLCanvasElement;
    this.canvasCxt = canvas.getContext("2d");
    this.startRendering(this.draw);
  },
  methods: {
    getDbMarkerHeight(db: number, previousDb?: number) {
      // for top marker, calculate total height from top
      if (previousDb === undefined) {
        return this.height - this.getMeterHeight(this.scaleY(db));
      }

      // else calculate height difference from previous marker
      const y = this.height - this.getMeterHeight(this.scaleY(db));
      const prevY = this.height - this.getMeterHeight(this.scaleY(previousDb));
      return y - prevY;
    },
    // convert dB to height from the bottom of the graph in pixels
    getMeterHeight(db: number) {
      return (
        this.height *
        ((DB_RANGE + db) / DB_RANGE) *
        (DB_RANGE / (DB_RANGE + DB_PADDING_TOP))
      );
    },
    scaleY(db: number): number {
      return curve.getCurvedValue(db + DB_RANGE) - DB_RANGE;
    },
    draw(): void {
      if (this.canvasCxt) {
        const dataArray = this.getFloatTimeDomainData();

        let db = -DB_RANGE;

        if (this.type === "peak" && dataArray) {
          db = this.getPeakDb(dataArray);
        } else if (this.type === "rms" && dataArray) {
          db = this.getRmsDb(dataArray);
        }

        const clipping = db > 0;
        db = clamp(db, -DB_RANGE, 0);

        const meterHeight = this.getMeterHeight(this.scaleY(db));

        this.canvasCxt.clearRect(0, 0, this.canvasWidth, this.height);

        this.canvasCxt.fillStyle = this.backgroundColor ?? theme.colors.light;
        this.canvasCxt.beginPath();
        this.canvasCxt.fillRect(0, 0, this.width, this.height);
        this.canvasCxt.stroke();

        this.canvasCxt.fillStyle = clipping
          ? (this.clippingColor ?? theme.colors.danger)
          : (this.barColor ?? theme.colors.success);
        this.canvasCxt.beginPath();
        this.canvasCxt.fillRect(
          0,
          this.height - meterHeight,
          this.width,
          meterHeight
        );
        this.canvasCxt.stroke();
      }
    }
  },
});
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
  transform: translateY(calc(50% - 0.1em)); /* shift the element down to center it on the exact db value */
  font-size: 0.6em;
}
.db-dash {
  padding-left: 4px;
  padding-right: 4px;
}
</style>
