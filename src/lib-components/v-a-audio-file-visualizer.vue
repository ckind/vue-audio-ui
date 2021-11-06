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
      xShiftMult: 0,
      zoom: 1,
      prevY: -1,
      prevX: -1,
      curedRange: new Pow2CurvedRange(0.0001, 1), // todo: adjust min value based on sample length?
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
    zoomMult() {
      // todo: find a better curve?
      // const scaledZoom = this.curedRange.getCurvedValue(this.zoom);scaledZoom;
      return Math.max(this.zoom, 128 / this.amplitudeData.length); // don't allow zooming in past X samples
    },
    zoomWindowLength() {
      return this.zoomWindowEndIndex - this.zoomWindowStartIndex;
    },
  },
  mounted() {
    this.canvas = this.$refs.visualizer as HTMLCanvasElement;
    this.canvasContext = this.canvas.getContext("2d");
  },
  methods: {
    loadAudioFromAmplitudeData(data: Float32Array) {
      this.amplitudeData = data;
      window.requestAnimationFrame(this.drawZoom);
    },
    shiftZoomWindow(numSamples: number) {
      this.zoomWindowStartIndex += numSamples;
      this.zoomWindowEndIndex += numSamples;
    },
    setZoomWindow() {
      // zoom in on markerIndex as if it were the center
      this.zoomWindowStartIndex = Math.floor(
        this.markerIndex - (this.amplitudeData.length * this.zoomMult) / 2
      );
      this.zoomWindowEndIndex = Math.floor(
        this.markerIndex + (this.amplitudeData.length * this.zoomMult) / 2
      );

      // shift the window so that the center of the zoom lines back up with the marker index
      const markerPositionCenterOffset =
        this.graphWidth / 2 - this.markerPosition;
      const markerPositionCenterOffsetMult =
        markerPositionCenterOffset / this.graphWidth;
      const zoomWindowShift = Math.floor(
        markerPositionCenterOffsetMult * this.zoomWindowLength
      );

      this.shiftZoomWindow(zoomWindowShift);
    },
    drawZoom() {
      this.setZoomWindow();
      this.drawAmplitude();
    },
    drawAmplitude() {
      // todo: low pass filter to prevent aliasing when down-sampling?
      const zoomResolution = Math.max(
        Math.round(
          (this.amplitudeData.length * this.zoomMult) /
            this.graphWidth /
            RESOLUTION_SCALER
        ),
        1
      );
      const pointDistance =
        this.graphWidth / (this.zoomWindowEndIndex - this.zoomWindowStartIndex);

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();

      // todo: apply some sort of sinusoidal interpolation
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
      document.getElementsByTagName("body")[0].classList.add("--no-text-select");

      const canvasX = this.canvas?.getBoundingClientRect()?.x as number;
      const xpos = e.clientX - canvasX;

      this.xShiftMult = 0;

      this.markerIndex = Math.floor(
        (this.amplitudeData.length * xpos) / this.graphWidth
      );
      this.markerPosition = xpos;
      window.requestAnimationFrame(this.drawAmplitude);

      window.addEventListener("mousemove", this.onClickDrag);
      window.addEventListener("mouseup", this.endDrag);

      console.log(this.zoomWindowStartIndex, this.zoomWindowEndIndex);
    },
    endDrag() {
      window.removeEventListener("mousemove", this.onClickDrag);
      this.prevY = -1;
      this.prevX = -1;

      document.getElementsByTagName("body")[0].classList.remove("--no-text-select");
    },
    onClickDrag(e: MouseEvent) {
      const currY = e.pageY;
      const currX = e.pageX;

      if (this.prevY >= 0) {
        const diffY = currY - this.prevY;
        this.zoom = fitToBounds(this.zoom - (diffY / DRAG_RANGE) * 1, 0, 1);
        this.setZoomWindow();
      }

      // todo: still need to figure out x shifting
      // if (this.prevX >= 0) {
      //   const diffX = currX - this.prevX;
      //   this.xShiftMult += diffX / this.graphWidth;
      //   this.shiftZoomWindow(
      //     Math.floor(this.xShiftMult * this.zoomWindowLength)
      //   );
      // }

      window.requestAnimationFrame(this.drawAmplitude);

      this.prevY = currY;
      this.prevX = currX;
    },
  },
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

<style>
.--no-text-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>