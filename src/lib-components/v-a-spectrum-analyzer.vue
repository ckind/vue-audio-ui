<template>
  <div ref="analyserCanvasContainer" class="canvas-container" :style="cssVars">
    <canvas ref="analyserCanvas" class="analyser-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useMetering from "@/composables/metering";
import useRendering from "@/composables/rendering";

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
    drawFrequencyDomain() {
      if (this.canvasContext) {
        const noiseFloor = -120; // noise floor in dB
        const yRange = 0 - noiseFloor;
        const highPassCutoff = 20; // don't plot frequencies below cutoff
        const nyquist = this.input.context.sampleRate / 2;

        const dataArray = this.getFloatFrequencyData();

        this.canvasContext.fillStyle = this.backgroundColor;
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = this.lineColor;
        this.canvasContext.fillStyle = this.lineColor;

        let x = 0;
        let y =
          this.height - ((dataArray[0] - noiseFloor) / yRange) * this.height;

        this.canvasContext.beginPath();

        for (let i = 0; i < dataArray.length; i++) {
          // const barWidth = 1;
          const barHeight =
            ((dataArray[i] - noiseFloor) / yRange) * this.height;

          const f = i * (nyquist / dataArray.length);

          this.canvasContext.moveTo(x, y);

          // only stretch the graph over the 20hz to nyquist range
          if (f >= highPassCutoff) {

            // todo: need to find a better way to stretch this over the x-axis
            // if (f < 1000) {
            //   // prettier-ignore
            //   x = Math.floor(
            //     Math.log2(f - highPassCutoff) / Math.log2(1000 - highPassCutoff) * this.width/2
            //   );
            // } else {
            //   // prettier-ignore
            //   x = Math.floor(
            //     Math.log2(f - highPassCutoff - 1000) / Math.log2(nyquist - highPassCutoff) * this.width/2 + this.width/2
            //   );
            // }

            // prettier-ignore
            x = Math.floor(
              Math.log2(f - highPassCutoff) / Math.log2(nyquist - highPassCutoff) * this.width
            );

            // prettier-ignore
            // x = Math.floor(
            //   (f - highPassCutoff) / (nyquist - highPassCutoff) * this.width
            // );

            y = this.height - barHeight;

            // this.canvasContext.fillRect(x, y, barWidth, barHeight);
          }

          this.canvasContext.lineTo(x, y);
        }

        this.canvasContext.stroke();

        this.drawFrequencyMarkers(highPassCutoff, nyquist);
      }
    },
    drawFrequencyMarkers(highPassCutoff: number, nyquist: number) {
      if (this.canvasContext) {
        let f = highPassCutoff;
        let x = 0;

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f}hz`, x, 100);

        f = 30;
        x = Math.floor(
          (Math.log2(f - highPassCutoff) /
            Math.log2(nyquist - highPassCutoff)) *
            this.width
        );

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f}hz`, x, 100);

        f = 100;
        x = Math.floor(
          (Math.log2(f - highPassCutoff) /
            Math.log2(nyquist - highPassCutoff)) *
            this.width
        );

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f}hz`, x, 100);

        f = 1000;
        x = Math.floor(
          (Math.log2(f - highPassCutoff) /
            Math.log2(nyquist - highPassCutoff)) *
            this.width
        );

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f / 1000}khz`, x, 100);

        f = 10000;
        x = Math.floor(
          (Math.log2(f - highPassCutoff) /
            Math.log2(nyquist - highPassCutoff)) *
            this.width
        );

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f / 1000}khz`, x, 100);

        f = nyquist;
        x = this.width;

        this.canvasContext.font = "14px Arial";
        this.canvasContext.fillText(`${f / 1000}khz`, x, 100);
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