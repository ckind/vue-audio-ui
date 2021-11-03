<template>
  <canvas
    :width="graphWidth"
    :height="graphHeight"
    ref="visualizer"
    class="visualizer-canvas"
    :style="cssVars"
  ></canvas>

  <canvas
    :width="graphWidth"
    :height="graphHeight"
    ref="zoomCanvas"
    class="visualizer-canvas"
    :style="cssVars"
  ></canvas>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { QuadBezierCurvedRange } from "@/util/curved-range";

const DEFAULT_ASPECT_RATIO = 3;

// greater number = greater drawing resolution
// lower number = better performance when drawing
// must be >= 1
const RESOLUTION_SCALER = 4;
const curedRange = new QuadBezierCurvedRange(0, 1);

export default defineComponent({
  name: "VAAudioFileVisualizer",
  data() {
    return {
      canvasContext: null as CanvasRenderingContext2D | null,
      canvasContext2: null as CanvasRenderingContext2D | null,
      amplitudeData: new Float32Array(),
    };
  },
  props: {
    lineColor: {
      required: false,
      type: String,
      default: "black",
    },
    backgroundColor: {
      required: false,
      type: String,
      default: "white",
    },
    width: {
      required: false,
      type: Number,
      default: 300,
    },
    height: {
      required: false,
      type: Number,
      default: -1,
    },
    zoom: {
      required: false,
      type: Number,
      default: 1,
    },
    selectionStart: {
      required: false,
      type: Number,
      default: 0,
    },
    selectionEnd: {
      required: false,
      type: Number,
      default: 0,
    },
  },
  computed: {
    cssVars() {
      return {
        "--line-color": `${this.lineColor}`,
        "--background-color": `${this.backgroundColor}`,
      };
    },
    graphWidth() {
      return this.width;
    },
    graphHeight() {
      return this.width / DEFAULT_ASPECT_RATIO;
    },
  },
  mounted() {
    this.canvasContext = (
      this.$refs.visualizer as HTMLCanvasElement
    ).getContext("2d");
    this.canvasContext2 = (
      this.$refs.zoomCanvas as HTMLCanvasElement
    ).getContext("2d");
  },
  methods: {
    loadAudioFromAmplitudeData(data: Float32Array) {
      this.amplitudeData = data;
      // this.drawAmplitude(this.zoom);
      window.requestAnimationFrame(() =>
        this.drawAmplitude(this.zoom, this.selectionStart, this.selectionEnd)
      );
    },
    drawAmplitude(zoom: number, selectionStart: number, selectionEnd: number) {
      // todo: find a better curve?
      const scaledZoom = curedRange.getCurvedValue(zoom);
      const zoomMult = Math.max(scaledZoom, 1 / this.amplitudeData.length); // don't allow zooming in past 1 sample

      const zoomWindowStartIndex = Math.floor(
        selectionStart * this.amplitudeData.length
      );
      const zoomWindowEndIndex = Math.max(
        Math.floor(selectionEnd * this.amplitudeData.length),
        zoomWindowStartIndex
      );

      // const zoomLength = Math.floor(this.amplitudeData.length - zoomWindowStartIndex);

      // todo: low pass filter to prevent aliasing when down-sampling?
      const zoomResolution = Math.max(
        Math.round(
          (this.amplitudeData.length * zoomMult) /
            this.graphWidth /
            RESOLUTION_SCALER
        ),
        1
      );
      // const zoomResolution = Math.max(
      //   Math.round(
      //     this.amplitudeData.length / (this.graphWidth / RESOLUTION_SCALER)
      //   ),
      //   1
      // );

      const pointDistance = this.graphWidth / this.amplitudeData.length;

      // draw canvas 1

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();
      
      let x = 0;
      let y = 0;
      for (let i = 0; i < this.amplitudeData.length; i += zoomResolution) {
        x = i * pointDistance;
        y =
          this.graphHeight / 2 + (this.amplitudeData[i] * this.graphHeight) / 2;
        this.canvasContext?.lineTo(x, y);
      }
      this.canvasContext?.lineTo(this.graphWidth, this.graphHeight / 2);
      this.canvasContext?.stroke();

      // draw zoom window markers
      this.canvasContext?.beginPath();
      this.canvasContext!.strokeStyle = "red";
      this.canvasContext?.moveTo(zoomWindowStartIndex * pointDistance, 0);
      this.canvasContext?.lineTo(
        zoomWindowStartIndex * pointDistance,
        this.graphHeight
      );
      this.canvasContext?.stroke();

      this.canvasContext?.beginPath();
      this.canvasContext!.strokeStyle = "blue";
      this.canvasContext?.moveTo(zoomWindowEndIndex * pointDistance, 0);
      this.canvasContext?.lineTo(
        zoomWindowEndIndex * pointDistance,
        this.graphHeight
      );
      this.canvasContext?.stroke();


      // draw canvas 2
      x = 0;
      y = 0;
      this.canvasContext2?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext2?.beginPath();
      for (let i = zoomWindowStartIndex; i < zoomWindowEndIndex; i += zoomResolution) {
        x = i * pointDistance;
        y =
          this.graphHeight / 2 + (this.amplitudeData[i] * this.graphHeight) / 2;
        this.canvasContext2?.lineTo(x, y);
      }
      this.canvasContext2?.lineTo(zoomWindowEndIndex * pointDistance, this.graphHeight / 2);
      this.canvasContext2?.stroke();
    },
  },
  watch: {
    zoom(value: number) {
      window.requestAnimationFrame(() =>
        this.drawAmplitude(value, this.selectionStart, this.selectionEnd)
      );
    },
    selectionStart(value: number) {
      window.requestAnimationFrame(() =>
        this.drawAmplitude(this.zoom, value, this.selectionEnd)
      );
    },
    selectionEnd(value: number) {
      window.requestAnimationFrame(() =>
        this.drawAmplitude(this.zoom, this.selectionStart, value)
      );
    },
  },
});
</script>

<style scoped>
.visualizer-canvas {
  display: block;
  border: 1px solid;
  border-color: var(--border-color);
}
</style>