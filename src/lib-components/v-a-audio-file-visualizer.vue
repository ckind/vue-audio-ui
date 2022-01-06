<template>
  <canvas
    :width="graphWidth"
    :height="graphHeight"
    ref="visualizer"
    class="visualizer-canvas"
    :style="cssVars"
    @mousedown="onCanvasMouseDown"
    @dblclick="onCanvasDoubleClick"
  ></canvas>
  <p>zoom: {{ zoom }}</p>
  <p>zoomWindowStartIndex: {{ zoomWindowStartIndex }}</p>
  <p>zoomWindowEndIndex: {{ zoomWindowEndIndex }}</p>
  <p>zoomWindowLength: {{ zoomWindowLength }}</p>
  <p>totalSamples: {{ amplitudeData.length }}</p>
  <p>markerIndex: {{ markerIndex }}</p>
  <p>markerPosition: {{ markerPosition }}</p>
  <p>graphWidth: {{ graphWidth }}</p>
  <p>
    binSize:
    {{ Math.max(Math.floor(zoomWindowLength / graphWidth), 1) }}
  </p>
  <p>
    binSize (raw):
    {{ Math.max(zoomWindowLength / graphWidth, 1) }}
  </p>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CurvedRange, LogCurvedRange } from "@/util/curved-range";
import { fitToBounds } from "@/util/math-helpers";

const DEFAULT_ASPECT_RATIO = 3;

// greater number = greater drawing resolution
// lower number = better performance when drawing
// must be >= 1
const RESOLUTION_SCALER = 4;
RESOLUTION_SCALER;
const DRAG_RANGE = 300;

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
      prevX: -1,
      curedRange: new LogCurvedRange(0, 1, 8) as CurvedRange, // todo: adjust curve based on sample length?,
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
      const scaledZoom = this.curedRange.getCurvedValue(this.zoom);
      return Math.max(scaledZoom, 16 / this.amplitudeData.length); // don't allow zooming in past X samples
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
      this.zoomWindowStartIndex =
        this.markerIndex -
        Math.round((this.amplitudeData.length * this.zoomMult) / 2);
      this.zoomWindowEndIndex =
        this.markerIndex +
        Math.round((this.amplitudeData.length * this.zoomMult) / 2);

      // shift the window so that the center of the zoom lines back up with the marker index
      const markerPositionCenterOffset =
        this.graphWidth / 2 - this.markerPosition;
      const markerPositionCenterOffsetMult =
        markerPositionCenterOffset / this.graphWidth;
      const zoomWindowShift = Math.round(
        markerPositionCenterOffsetMult * this.zoomWindowLength
      );
      this.shiftZoomWindow(zoomWindowShift);

      // keep the window within bounds of the sample data
      let shiftCorrection = 0;

      shiftCorrection +=
        this.zoomWindowStartIndex < 0 ? -this.zoomWindowStartIndex : 0;
      shiftCorrection +=
        this.zoomWindowEndIndex > this.amplitudeData.length
          ? this.amplitudeData.length - this.zoomWindowEndIndex
          : 0;

      this.shiftZoomWindow(shiftCorrection);
    },
    drawZoom() {
      this.setZoomWindow();
      this.drawAmplitude();
    },
    getMaxSampleValue(
      sampleData: Float32Array,
      startIndex: number,
      endIndex: number
    ): number {
      let max = Number.MIN_VALUE;
      for (let i = startIndex; i < endIndex; i++) {
        max = Math.max(max, sampleData[i]);
      }
      return max;
    },
    getMinSampleValue(
      sampleData: Float32Array,
      startIndex: number,
      endIndex: number
    ): number {
      let min = Number.MAX_VALUE;
      for (let i = startIndex; i < endIndex; i++) {
        min = Math.min(min, sampleData[i]);
      }
      return min;
    },
    getAvgSampleValue(
      sampleData: Float32Array,
      startIndex: number,
      endIndex: number
    ): number {
      let sum = 0;
      for (let i = startIndex; i < endIndex; i++) {
        sum += Math.abs(sampleData[i]);
      }
      return sum/(endIndex - startIndex);
    },
    drawAmplitudeSamples() {
      // todo: low pass filter to prevent aliasing when down-sampling?
      const binSize = Math.max(
        Math.ceil(this.zoomWindowLength / this.graphWidth),
        1
      );
      const pointDistance =
        this.graphWidth / (this.zoomWindowEndIndex - this.zoomWindowStartIndex);

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();

      // todo: apply some sort of sinusoidal interpolation?
      let x = 0;
      let y = 0;
      let amplitude = 0;

      // draw samples within the zoomWindow

      // todo: instead of drawing of nth pixel, take the max or average of each bin?
      // draw line at each x with min and max sample value?
      for (
        let i = this.zoomWindowStartIndex;
        i < this.zoomWindowEndIndex;
        i += binSize
      ) {
        // amplitude = this.getMaxSampleValue(this.amplitudeData, i, i + binSize);
        amplitude = this.amplitudeData[i];

        x = (i - this.zoomWindowStartIndex) * pointDistance;
        y =
          this.graphHeight -
          (this.graphHeight / 2 + (amplitude * this.graphHeight) / 2);
        this.canvasContext?.lineTo(x, y); // todo: do we need to draw line if distance between samples is less than 1 px;
      }

      this.canvasContext?.lineTo(this.graphWidth, this.graphHeight / 2);
      this.canvasContext?.stroke();

      this.canvasContext?.beginPath();
      this.canvasContext!.strokeStyle = "red";
      this.canvasContext?.moveTo(this.markerPosition, 0);
      this.canvasContext?.lineTo(this.markerPosition, this.graphHeight);
      this.canvasContext?.stroke();
    },
    drawAmplitudeAvg() {
      const binSize = Math.max(
        Math.floor(this.zoomWindowLength / this.graphWidth),
        1
      );

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();

      let x = 0;
      let y = 0;
      let avg = 0;

      // draw samples within the zoomWindow
      for (let i = 0; i < this.graphWidth; i++) {
        x = i;

        avg = this.getAvgSampleValue(
          this.amplitudeData,
          this.zoomWindowStartIndex + i * binSize,
          this.zoomWindowStartIndex + (i + 1) * binSize
        );

        y =
          this.graphHeight -
          (this.graphHeight / 2 + (avg * this.graphHeight) / 2);

        this.canvasContext?.moveTo(x, y);

        y =
          this.graphHeight -
          (this.graphHeight / 2 + (-avg * this.graphHeight) / 2);

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
    drawAmplitudeMinMax() {
      const binSize = Math.max(
        Math.floor(this.zoomWindowLength / this.graphWidth),
        1
      );

      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.backgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.strokeStyle = this.lineColor;
      this.canvasContext?.beginPath();

      let x = 0;
      let y = 0;
      let min = 0;
      let max = 0;

      // draw samples within the zoomWindow
      for (let i = 0; i < this.graphWidth; i++) {
        x = i;

        min = this.getMinSampleValue(
          this.amplitudeData,
          this.zoomWindowStartIndex + i * binSize,
          this.zoomWindowStartIndex + (i + 1) * binSize
        );
        max = this.getMaxSampleValue(
          this.amplitudeData,
          this.zoomWindowStartIndex + i * binSize,
          this.zoomWindowStartIndex + (i + 1) * binSize
        );

        y =
          this.graphHeight -
          (this.graphHeight / 2 + (min * this.graphHeight) / 2);

        this.canvasContext?.moveTo(x, y);

        y =
          this.graphHeight -
          (this.graphHeight / 2 + (max * this.graphHeight) / 2);

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
    drawAmplitude() {
      if (this.zoomWindowLength > this.graphWidth) {
        // this.drawAmplitudeMinMax();
        // this.drawAmplitudeSamples();
        this.drawAmplitudeAvg();
      } else {
        this.drawAmplitudeSamples();
      }
    },
    onCanvasDoubleClick() {
      this.markerIndex = 0;
      this.markerPosition = 0;
      this.zoom = 1;
      this.zoomWindowStartIndex = 0;
      this.zoomWindowEndIndex = this.amplitudeData.length;
    },
    onCanvasMouseDown(e: MouseEvent) {
      document
        .getElementsByTagName("body")[0]
        .classList.add("--no-text-select");

      const canvasX = this.canvas?.getBoundingClientRect()?.x as number;
      const xpos = e.clientX - canvasX;

      this.markerIndex =
        Math.round((xpos / this.graphWidth) * this.zoomWindowLength) +
        this.zoomWindowStartIndex;

      this.markerPosition = xpos;

      window.requestAnimationFrame(this.drawAmplitude);

      window.addEventListener("mousemove", this.onClickDrag);
      window.addEventListener("mouseup", this.endDrag);
    },
    endDrag() {
      window.removeEventListener("mousemove", this.onClickDrag);
      this.prevY = -1;
      this.prevX = -1;

      document
        .getElementsByTagName("body")[0]
        .classList.remove("--no-text-select");
    },
    onClickDrag(e: MouseEvent) {
      const currY = e.pageY;
      const currX = e.pageX;

      const diffX = currX - this.prevX;
      const diffY = currY - this.prevY;

      if (Math.abs(diffX) >= Math.abs(diffY)) {
        if (this.prevX >= 0) {
          let shiftXNumSamples = Math.round(
            (diffX / this.graphWidth) * this.zoomWindowLength
          );

          const minShift = -this.zoomWindowStartIndex; // don't allowing shifting past zero
          const maxShift = this.amplitudeData.length - this.zoomWindowEndIndex; // don't allowing shifting after end

          shiftXNumSamples = fitToBounds(shiftXNumSamples, minShift, maxShift);

          this.shiftZoomWindow(-shiftXNumSamples);
          this.markerIndex -= shiftXNumSamples;
        }
      } else {
        if (this.prevY >= 0) {
          this.zoom = fitToBounds(this.zoom - (diffY / DRAG_RANGE) * 1, 0, 1);
          this.setZoomWindow();
        }
      }

      this.markerPosition = Math.round(
        ((this.markerIndex - this.zoomWindowStartIndex) /
          this.zoomWindowLength) *
          this.graphWidth
      );

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