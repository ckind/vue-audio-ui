<template>
  <canvas
    class="meter"
    ref="meterCanvas"
    :height="height"
    :width="canvasWidth"
  />
</template>

<script lang="ts">
import { defineComponent, type PropType, watch } from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { type DigitalMeterType } from "@/types/vue-audio-ui-types";
import { LogCurvedRange } from "@/util/curved-range.ts"
import { fitToBounds } from "@/util/math-helpers.ts";
import theme from '@/theme.ts';

const DB_RANGE = 90;
const curve = new LogCurvedRange(0, DB_RANGE, 2);

export default defineComponent({
  name: "VADigitalMeter",
  props: {
    input: {
      required: false,
      type: AudioNode,
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
    },
    font: {
      required: false,
      type: String,
      default: "Helvetica, sans-serif",
    },
  },
  computed: {
    canvasWidth(): number {
      return this.width + (this.drawMarkers ? 30 : 0);
    },
  },
  setup(props) {
    const metering = useMetering(props.fftSize, props.input);

    watch(() => props.input, metering.onInputChanged);

    return {
      ...metering,
      ...useRendering()
    };
  },
  data() {
    return {
      canvasCxt: null as CanvasRenderingContext2D | null,
    };
  },
  mounted() {
    const canvas = this.$refs.meterCanvas as HTMLCanvasElement;
    this.canvasCxt = canvas.getContext("2d");
    this.startRendering(this.draw);
  },
  methods: {
    getMeterHeight(db: number) {
      return (
        this.height *
        ((DB_RANGE + db) / DB_RANGE) *
        (DB_RANGE / (DB_RANGE + 10)) // add a little padding up to the top
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

        // todo: discarding everything above 0 for now
        // find a way way to display clipping
        const clipping = db > 0;
        db = fitToBounds(db, -DB_RANGE, 0);

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

        if (this.drawMarkers) {
          this.drawDbMarkers();
        }
      }
    },
    drawDbMarkers(): void {
      // this.drawDbMarker(6);
      this.drawDbMarker(0);
      this.drawDbMarker(-10);
      this.drawDbMarker(-20);
      this.drawDbMarker(-30);
      this.drawDbMarker(-40);
      this.drawDbMarker(-60);
    },
    drawDbMarker(db: number): void {
      const y = this.height - this.getMeterHeight(this.scaleY(db));
      const x = this.width + 4;

      this.canvasCxt!.lineWidth = 1;
      this.canvasCxt!.strokeStyle = this.markerColor ?? theme.colors.muted;

      this.canvasCxt?.beginPath();
      this.canvasCxt?.moveTo(x, y);
      this.canvasCxt?.lineTo(x + 4, y);
      this.canvasCxt?.stroke();

      this.canvasCxt!.font = `10px ${this.font}`;
      this.canvasCxt!.fillStyle = this.markerColor ?? theme.colors.muted;
      this.canvasCxt!.fillText(`${Math.abs(db)}`, x + 8, y + 3);
    },
  },
});
</script>

<style scoped>
</style>
