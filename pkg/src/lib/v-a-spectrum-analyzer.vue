<template>
  <canvas
    :width="graphWidth"
    :height="graphHeight"
    ref="analyserCanvas"
    class="analyser-canvas"
    :style="cssVars"
    ></canvas>
</template>

<script lang="ts">
import { defineComponent, type PropType, watch } from "vue";
import { useMetering } from "@/composables/useMetering";
import { useRendering } from "@/composables/useRendering";
import { isPowerOfTwo } from '@/util/math-helpers';
import theme from '@/theme.ts';

const HIGH_PASS_CUTOFF = 20;
const NOISE_FLOOR = -120;
const DEFAULT_ASPECT_RATIO = 3;

type FillStyleType = "solid" | "lines" | "none";

export default defineComponent({
  name: "VASpectrumAnalyzer",
  data() {
    return {
      continueDrawing: false,
      canvas: null as HTMLCanvasElement | null,
      canvasContext: null as CanvasRenderingContext2D | null
    };
  },
  props: {
    input: {
      required: false,
      type: Object, // type: AudioNode -- need to use Object for SSR
    },
    fftSize: {
      type: Number,
      required: false,
      default: 1024,
      // todo: this breaks types with options api
      // validator(n: number) {
      //   return n >= 32 && n <= 32768 && isPowerOfTwo(n);
      // }
    },
    height: {
      type: Number,
      required: false
    },
    width: {
      type: Number,
      required: false,
      default: 500,
    },
    fillStyle: {
      type: String as PropType<FillStyleType>,
      required: false,
      default: "none"
    },
    lineColor: {
      type: String,
      required: false
    },
    backgroundColor: {
      type: String,
      required: false,
      default: "black",
    },
    gridColor: {
      type: String,
      required: false,
      default: "gray",
    },
    dbColor: {
      type: String,
      required: false,
      default: "gray",
    },
    hzColor: {
      type: String,
      required: false,
      default: "white",
    },

    font: {
      required: false,
      type: String,
      default: "Helvetica, sans-serif",
    },

  },
  setup(props) {
    const metering = useMetering(props.fftSize, props.input as AudioNode | undefined);

    watch(() => props.input, (newVal, oldVal) => {
      metering.onInputChanged(newVal as AudioNode | undefined, oldVal as AudioNode | undefined);
    });

    return {
      ...metering,
      ...useRendering(),
    };
  },
  computed: {
    graphWidth(): number {
      return this.width;
    },
    graphHeight(): number {
      return this.height ? this.height : this.width / DEFAULT_ASPECT_RATIO;
    },
    cssVars() {
      return {
        '--border-color': this.backgroundColor
      }
    }
  },
  mounted() {
    this.canvasContext = (
      this.$refs.analyserCanvas as HTMLCanvasElement
    ).getContext("2d");
    this.startRendering(this.drawFrequencyDomain);
  },
  methods: {
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

        // todo: input won't get assigned until callback in SSR 
        // assume 48000 sample rate until set for now,
        // will snap to actual sample rate as soon as input is set though
        const nyquist = this.input
          ? this.input.context.sampleRate / 2
          : 24000;

        const dataArray = this.getFloatFrequencyData();

        this.canvasContext.clearRect(0, 0, this.graphWidth, this.graphHeight);

        this.canvasContext.fillStyle = this.backgroundColor;
        this.canvasContext.fillRect(0, 0, this.graphWidth, this.graphHeight);

        if (dataArray) {
          this.canvasContext.beginPath();

          this.canvasContext.lineWidth = 1;
          this.canvasContext.strokeStyle = this.lineColor ?? theme.colors.primary;
          this.canvasContext.fillStyle = this.lineColor ?? theme.colors.primary;

          this.canvasContext.moveTo(0, this.graphHeight);

          let x = 0;
          let y =
            this.graphHeight -
            ((dataArray[0]! - NOISE_FLOOR) / yRange) * this.graphHeight;

          for (let i = 0; i < dataArray.length; i++) {
            const barHeight =
              ((dataArray[i]! - NOISE_FLOOR) / yRange) * this.graphHeight;

            const f = i * (nyquist / dataArray.length);

            this.canvasContext.lineTo(x, y);

            // only stretch the graph over the 20hz to nyquist range
            if (f >= HIGH_PASS_CUTOFF) {
              x = this.scaleX(f, HIGH_PASS_CUTOFF, nyquist, this.graphWidth);
              y = this.graphHeight - barHeight;

              if (this.fillStyle === "lines") {
                const barWidth = 1;
                this.canvasContext.fillRect(x, y, barWidth, barHeight);
              }
            }

            this.canvasContext.lineTo(x, y);
          }

          this.canvasContext.lineTo(this.graphWidth, this.graphHeight);
          this.canvasContext.closePath();
          this.canvasContext.stroke();

          if (this.fillStyle === "solid") this.canvasContext.fill();
        }

        this.drawDbMarkers(); // todo: is this actually in decibels?
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
          this.graphHeight -
          ((NOISE_FLOOR - db) / NOISE_FLOOR) * this.graphHeight;

        this.canvasContext.strokeStyle = this.dbColor;
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(0, y);
        this.canvasContext.lineTo(this.graphWidth, y);
        this.canvasContext.stroke();

        this.canvasContext.font = `12px ${this.font}`;
        this.canvasContext.fillStyle = this.gridColor;
        this.canvasContext.fillText(`${db}db`, 10, y);
      }
    },
    drawFrequencyMarkers(nyquist: number) {
      this.drawFrequencyMarker(
        HIGH_PASS_CUTOFF,
        nyquist,
        this.graphWidth > 300,
        false
      );
      this.drawFrequencyMarker(25, nyquist);
      this.drawFrequencyMarker(50, nyquist, true);
      this.drawFrequencyMarker(100, nyquist);
      this.drawFrequencyMarker(200, nyquist, this.graphWidth > 600);
      this.drawFrequencyMarker(500, nyquist, this.graphWidth > 300);
      this.drawFrequencyMarker(1000, nyquist, this.graphWidth > 600);
      this.drawFrequencyMarker(1500, nyquist);
      this.drawFrequencyMarker(2000, nyquist, true);
      this.drawFrequencyMarker(3000, nyquist, this.graphWidth > 600);
      this.drawFrequencyMarker(5000, nyquist, this.graphWidth > 300);
      this.drawFrequencyMarker(7000, nyquist, this.graphWidth > 600);
      this.drawFrequencyMarker(10000, nyquist, true);
      this.drawFrequencyMarker(15000, nyquist, this.graphWidth > 600);
      this.drawFrequencyMarker(20000, nyquist, this.graphWidth > 800);
    },
    drawFrequencyMarker(
      f: number,
      nyquist: number,
      drawLabel: boolean = false,
      drawGridLine: boolean = true
    ) {
      if (this.canvasContext && f >= HIGH_PASS_CUTOFF) {
        const x = this.scaleX(f, HIGH_PASS_CUTOFF, nyquist, this.graphWidth);

        if (drawGridLine) {
          this.canvasContext.strokeStyle = this.gridColor;
          this.canvasContext.beginPath();
          this.canvasContext.moveTo(x, 0);
          this.canvasContext.lineTo(x, this.graphWidth);
          this.canvasContext.stroke();
        }

        if (drawLabel) {
          this.canvasContext.font = `14px ${this.font}`;

          this.canvasContext.fillStyle = this.hzColor ?? theme.colors.primary;
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
.analyser-canvas {
  display: block;
  border: 1px solid;
  border-color: var(--border-color);
}
</style>