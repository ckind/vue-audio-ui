<template>
  <canvas
    :width="graphWidth"
    :height="graphHeight"
    ref="visualizer"
    class="visualizer-canvas"
    :style="cssVars"
    @mousedown="onCanvasMouseDown"
  ></canvas>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Pow2CurvedRange } from "@/util/curved-range";
import { fitToBounds } from "@/util/math-helpers";

const DEFAULT_ASPECT_RATIO = 3;

// greater number = greater drawing resolution
// lower number = better performance when drawing
// must be >= 1
const RESOLUTION_SCALER = 4;
const DRAG_RANGE = 70;

export default defineComponent({
  name: "VAAudioFileVisualizer",
  data() {
    return {
      canvas: null as HTMLCanvasElement | null,
      canvasContext: null as CanvasRenderingContext2D | null,
      amplitudeData: new Float32Array(),
      markerPosition: 0,
      markerIndex: 0,
      zoomWindowStartIndex: 0,
      zoomWindowEndIndex: 0,
      zoom: 1,
      prevY: -1,
      curedRange: new Pow2CurvedRange(0.0001, 1) // todo: adjust min value based on sample length?
    };
  },
  props: {
    lineColor: {
      required: false,
      type: String,
      default: "pink",
    },
    backgroundColor: {
      required: false,
      type: String,
      default: "black",
    },
    width: {
      required: false,
      type: Number,
      default: 800,
    },
    height: {
      required: false,
      type: Number,
      default: -1,
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
    this.canvas = this.$refs.visualizer as HTMLCanvasElement;
    this.canvasContext = this.canvas.getContext("2d");
  },
  methods: {
    loadAudioFromAmplitudeData(data: Float32Array) {
      this.amplitudeData = data;
      window.requestAnimationFrame(this.drawAmplitude);
    },
    drawAmplitude() {
      // todo: find a better curve?
      const scaledZoom = this.curedRange.getCurvedValue(this.zoom);scaledZoom;
      let zoomMult = Math.max(scaledZoom, 1 / this.amplitudeData.length); // don't allow zooming in past 1 sample

      // todo: caculate midIndex relative to the marker position?
      const midIndex = this.amplitudeData.length / 2;midIndex;
      const shiftAmount = -1000000;

      console.log(shiftAmount);

      this.zoomWindowStartIndex = Math.floor(this.markerIndex - (this.amplitudeData.length * zoomMult)/2);
      this.zoomWindowEndIndex = Math.floor(this.markerIndex + (this.amplitudeData.length * zoomMult)/2);

      // console.log(this.amplitudeData.length, midIndex, this.zoomWindowStartIndex, this.zoomWindowEndIndex);

      const zoomWindowLength = this.zoomWindowEndIndex - this.zoomWindowStartIndex;
      this.markerPosition = ((this.markerIndex - this.zoomWindowStartIndex) / zoomWindowLength) * this.graphWidth;


      // todo: low pass filter to prevent aliasing when down-sampling?
      const zoomResolution = Math.max(
        Math.round(
          (this.amplitudeData.length * zoomMult) /
            this.graphWidth /
            RESOLUTION_SCALER
        ),
        1
      );
      const pointDistance = this.graphWidth / zoomWindowLength;

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();

      let x = 0;
      let y = 0;
      for (
        let i = this.zoomWindowStartIndex;
        i < this.zoomWindowEndIndex;
        i += zoomResolution
      ) {
        x = (i - this.zoomWindowStartIndex) * pointDistance;
        y =
          this.graphHeight / 2 + (this.amplitudeData[i] * this.graphHeight) / 2;
        this.canvasContext?.lineTo(x, y);
      }
      this.canvasContext?.lineTo(this.graphWidth, this.graphHeight / 2);
      this.canvasContext?.stroke();

      this.canvasContext?.beginPath();
      this.canvasContext!.strokeStyle = "red";
      this.canvasContext?.moveTo(this.markerPosition, 0);
      this.canvasContext?.lineTo(this.markerPosition, this.graphHeight);
      this.canvasContext?.stroke();
    },
    onCanvasMouseDown(e: MouseEvent) {
      const canvasX = this.canvas?.getBoundingClientRect()?.x as number;
      const xpos = e.clientX - canvasX;

      this.markerIndex = Math.floor(this.amplitudeData.length * xpos/this.graphWidth);
      this.markerPosition = xpos;
      window.requestAnimationFrame(this.drawAmplitude);

      window.addEventListener("mousemove", this.onClickDrag);
      window.addEventListener("mouseup", this.endDrag);
    },
    endDrag() {
      window.removeEventListener("mousemove", this.onClickDrag);
      this.prevY = -1;
    },
    onClickDrag(e: MouseEvent) {
      const currY = e.pageY;

      if (this.prevY >= 0) {
        const diffY = currY - this.prevY;
        this.zoom = fitToBounds(this.zoom - diffY/DRAG_RANGE * 1, 0, 1);
      }

      window.requestAnimationFrame(this.drawAmplitude);

      this.prevY = currY;
    }
  }
});
</script>

<style scoped>
.visualizer-canvas {
  display: inline-block;
  border: 1px solid;
  border-color: var(--border-color);
  cursor: move;
}
</style>