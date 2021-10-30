<template>
  <div ref="analyserCanvasContainer" class="canvas-container" :style="cssVars">
    <canvas ref="analyserCanvas" class="analyser-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useMetering from "@/composables/metering";
import useRendering from "@/composables/rendering";

const HIGH_PASS_CUTOFF = 20;
const NOISE_FLOOR = -120;

export default defineComponent({
  name: "VASpectrumAnalyzer",
  data() {
    return {
      continueDrawing: false,
      height: 0,
      width: 0,
      canvas: null as HTMLCanvasElement | null,
      canvasContext: null as CanvasRenderingContext2D | null,
      resizeObserver: null as ResizeObserver | null,
    };
  },
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
    fftSize: {
      type: Number,
      required: false,
      default: 2048,
    },
    lineColor: {
      type: String,
      required: false,
      default: "white",
    },
    backgroundColor: {
      type: String,
      required: false,
      default: "black",
    },
    graphHeight: {
      type: String,
      required: false,
      default: "30%",
    },
    graphWidth: {
      type: String,
      required: false,
      default: "100%",
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
    cssVars() {
      return {
        "--graph-height": this.graphHeight,
        "--graph-width": this.graphWidth,
      };
    },
  },
  created() {
    this.input.connect(this.analyzer);
    this.startRendering(this.drawFrequencyDomain);
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.recomputeDimensions);
    this.resizeObserver.observe(
      this.$refs.analyserCanvasContainer as HTMLElement
    );
    this.canvasContext = (
      this.$refs.analyserCanvas as HTMLCanvasElement
    ).getContext("2d");
  },
  methods: {
    recomputeDimensions() {
      if (this.$refs.analyserCanvasContainer) {
        const rect = (
          this.$refs.analyserCanvasContainer as HTMLElement
        ).getBoundingClientRect();
        (this.$refs.analyserCanvas as HTMLCanvasElement).width = rect.width;
        (this.$refs.analyserCanvas as HTMLCanvasElement).height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
      }
    },
    scaleX(
      f: number,
      rangeMinHz: number,
      rangeMaxHz: number,
      width: number
    ): number {
      const baseXAxisLogFactor = 1 / 3.321; // magic number.

      let xAxisLogFactor = (rangeMaxHz - rangeMinHz) / rangeMaxHz;
      xAxisLogFactor *= 1.0 - baseXAxisLogFactor;
      xAxisLogFactor = 1.0 - xAxisLogFactor;

      let x = (f - rangeMinHz) / (rangeMaxHz - rangeMinHz);
      x = Math.pow(x, xAxisLogFactor);
      if (x < 1.0) {
        x *= width;
      }

      return x;
    },
    scaleXLegacy(
      f: number,
      rangeMinHz: number,
      rangeMaxHz: number,
      width: number
    ): number {
      // old way of doing it
      // prettier-ignore
      const x = Math.floor(
        Math.log2(f - rangeMinHz) / Math.log2(rangeMaxHz - rangeMinHz) * width
      );

      return x;
    },
    drawFrequencyDomain() {
      if (this.canvasContext) {
        const yRange = 0 - NOISE_FLOOR;
        const nyquist = this.input.context.sampleRate / 2;

        const dataArray = this.getFloatFrequencyData();

        this.canvasContext.fillStyle = this.backgroundColor;
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = this.lineColor;
        this.canvasContext.fillStyle = this.lineColor;

        let x = 0;
        let y =
          this.height - ((dataArray[0] - NOISE_FLOOR) / yRange) * this.height;

        this.canvasContext.beginPath();

        for (let i = 0; i < dataArray.length; i++) {
          // const barWidth = 1;
          const barHeight =
            ((dataArray[i] - NOISE_FLOOR) / yRange) * this.height;

          const f = i * (nyquist / dataArray.length);

          this.canvasContext.moveTo(x, y);

          // only stretch the graph over the 20hz to nyquist range
          if (f >= HIGH_PASS_CUTOFF) {
            x = this.scaleX(f, HIGH_PASS_CUTOFF, nyquist, this.width);

            y = this.height - barHeight;

            // this.canvasContext.fillRect(x, y, barWidth, barHeight);
          }

          this.canvasContext.lineTo(x, y);
        }

        this.canvasContext.stroke();

        this.drawDbMarkers();
        this.drawFrequencyMarkers(nyquist);
      }
    },
    drawDbMarkers() {
      this.drawDbMarker(-20);
      this.drawDbMarker(-40);
      this.drawDbMarker(-60);
      this.drawDbMarker(-80);
      this.drawDbMarker(-100);
    },
    drawDbMarker(db: number) {
      if (this.canvasContext) {
        const y =
          this.height - ((NOISE_FLOOR - db) / NOISE_FLOOR) * this.height;

        this.canvasContext.strokeStyle = "gray";
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(0, y);
        this.canvasContext.lineTo(this.width, y);
        this.canvasContext.stroke();

        this.canvasContext.font = "12px Arial";
        this.canvasContext.fillStyle = "gray";
        this.canvasContext.fillText(`${db}db`, 10, y);
      }
    },
    drawFrequencyMarkers(nyquist: number) {
      this.drawFrequencyMarker(HIGH_PASS_CUTOFF, nyquist, true);
      this.drawFrequencyMarker(25, nyquist);
      this.drawFrequencyMarker(50, nyquist, true);
      this.drawFrequencyMarker(100, nyquist);
      this.drawFrequencyMarker(200, nyquist, true);
      this.drawFrequencyMarker(500, nyquist, true);
      this.drawFrequencyMarker(1000, nyquist, true);
      this.drawFrequencyMarker(1500, nyquist);
      this.drawFrequencyMarker(2000, nyquist, true);
      this.drawFrequencyMarker(3000, nyquist, true);
      this.drawFrequencyMarker(5000, nyquist, true);
      this.drawFrequencyMarker(7000, nyquist, true);
      this.drawFrequencyMarker(10000, nyquist, true);
      this.drawFrequencyMarker(15000, nyquist, true);
      this.drawFrequencyMarker(20000, nyquist, true);
    },
    drawFrequencyMarker(
      f: number,
      nyquist: number,
      drawLabel: boolean = false
    ) {
      if (this.canvasContext && f >= HIGH_PASS_CUTOFF) {
        const x = this.scaleX(f, HIGH_PASS_CUTOFF, nyquist, this.width);

        this.canvasContext.strokeStyle = "gray";
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(x, 0);
        this.canvasContext.lineTo(x, this.height);
        this.canvasContext.stroke();

        if (drawLabel) {
          this.canvasContext.font = "14px Arial";

          this.canvasContext.fillStyle = this.lineColor;
          if (f < 1000) {
            this.canvasContext.fillText(`${f}hz`, x, 50);
          } else {
            this.canvasContext.fillText(`${f / 1000}khz`, x, 50);
          }
        }
      }
    },
  },
});
</script>

<style scoped>
.canvas-container {
  width: var(--graph-width);
  padding-top: var(--graph-height);
  position: relative;
  z-index: 1;
}
.analyser-canvas {
  z-index: 2;
  position: absolute;
  top: 0;
}
</style>