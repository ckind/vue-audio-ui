<template>
  <canvas
    class="meter"
    ref="meterCanvas"
    :height="height"
    :width="canvasWidth"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { DigitalMeterType } from "@/types/v-audio-ui-types";
// import { QuadBezierCurvedRange } from "@/util/curved-range"
import { LogCurvedRange } from "@/util/curved-range"
import { fitToBounds } from "@/util/math-helpers";

const DB_RANGE = 90;
// const curve = new QuadBezierCurvedRange(0, DB_RANGE);
const curve = new LogCurvedRange(0, DB_RANGE, 2);

export default defineComponent({
  name: "VADigitalMeter",
  props: {
    input: {
      required: true,
      type: AudioNode,
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
      default: "#e64a19",
    },
    barColor: {
      required: false,
      type: String,
      default: "#4caf50",
    },
    backgroundColor: {
      required: false,
      type: String,
      default: "#e0e0e0",
    },
    markerColor: {
      required: false,
      type: String,
      default: "gray",
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
    const input = props.input as AudioNode;

    return {
      ...useMetering(input.context, props.fftSize),
      ...useRendering(),
    };
  },
  data() {
    return {
      canvasCxt: null as CanvasRenderingContext2D | null,
    };
  },
  created() {
    this.input.connect(this.analyzer);
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

        let db = 0;

        if (this.type === "peak") {
          db = this.getPeakDb(dataArray);
        } else if (this.type === "rms") {
          db = this.getRmsDb(dataArray);
        }

        // todo: discarding everything above 0 for now
        // find a way way to display clipping
        const clipping = db > 0;
        db = fitToBounds(db, -DB_RANGE, 0);

        const meterHeight = this.getMeterHeight(this.scaleY(db));

        this.canvasCxt.clearRect(0, 0, this.canvasWidth, this.height);

        this.canvasCxt.fillStyle = this.backgroundColor;
        this.canvasCxt.beginPath();
        this.canvasCxt.fillRect(0, 0, this.width, this.height);
        this.canvasCxt.stroke();

        this.canvasCxt.fillStyle = clipping ? this.clippingColor : this.barColor;
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
      this.canvasCxt!.strokeStyle = this.markerColor;

      this.canvasCxt?.beginPath();
      this.canvasCxt?.moveTo(x, y);
      this.canvasCxt?.lineTo(x + 4, y);
      this.canvasCxt?.stroke();

      this.canvasCxt!.font = `10px ${this.font}`;
      this.canvasCxt!.fillStyle = this.markerColor;
      this.canvasCxt!.fillText(`${Math.abs(db)}`, x + 8, y + 3);
    },
  },
});
</script>

<style scoped>
</style>
