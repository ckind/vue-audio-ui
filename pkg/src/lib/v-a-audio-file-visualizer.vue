<template>
  <!-- todo: touch events -->
  <canvas
    ref="visualizer"
    class="visualizer-canvas"
    :style="cssVars"
    :width="graphWidth"
    :height="graphHeight"
    @mousedown="onCanvasMouseDown"
    @dblclick="onCanvasDoubleClick"
  ></canvas>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { type CurvedRange, LinearCurvedRange, LogCurvedRange } from "@/util/curved-range.ts";
import { clamp } from "@/util/math-helpers.ts";
import theme from '@/theme.ts';

const DEFAULT_ASPECT_RATIO = 3;
const DRAG_RANGE = 300;

export default defineComponent({
  name: "VAAudioFileVisualizer",
  data() {
    return {
      canvas: null as HTMLCanvasElement | null,
      canvasContext: null as CanvasRenderingContext2D | null,
      amplitudeData: new Float32Array(),
      // x coordinate of the marker position on the canvas (in px)
      markerPosition: 0,
      // sample index of where the marker is placed
      markerIndex: 0,
      // starting sample index of the zoom window
      zoomWindowStartIndex: 0,
      // ending sample index of the zoom window
      zoomWindowEndIndex: 0,
      // value between 0 and 1 representing how far zoomed the graph is
      zoom: 1,
      prevY: -1,
      prevX: -1,
      // todo: adjust curve based on sample length?
      curedRange: new LogCurvedRange(0, 1, 8) as CurvedRange, 
    };
  },
  props: {
    lineColor: {
      required: false,
      type: String,
    },
    backgroundColor: {
      required: false,
      type: String,
    },
    width: {
      required: false,
      type: Number,
      default: 600,
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
        "--line-color": `${this.canvasLineColor}`,
        "--background-color": `${this.canvasBackgroundColor}`,
      };
    },
    graphWidth() {
      return this.width;
    },
    graphHeight() {
      return this.width / DEFAULT_ASPECT_RATIO;
    },
    zoomMult() {
      const MAX_ZOOM_SAMPLES = 16;
      const scaledZoom = this.curedRange.getCurvedValue(this.zoom);
      // todo: this bugs out if total num samples is < 16
      return Math.max(scaledZoom, MAX_ZOOM_SAMPLES / this.amplitudeData.length); 
    },
    // number of samples between start and end of zoom window
    zoomWindowLength() {
      return this.zoomWindowEndIndex - this.zoomWindowStartIndex;
    },
    canvasLineColor() {
      return this.lineColor ?? theme.colors.white;
    },
    canvasBackgroundColor() {
      return this.backgroundColor ?? theme.colors.black;
    },
    canvasMarkerColor() {
      return theme.colors.primary;
    }
  },
  mounted() {
    this.canvas = this.$refs.visualizer as HTMLCanvasElement;
    this.canvasContext = this.canvas.getContext("2d");
  },
  methods: {
    loadAudioFromAmplitudeData(data: Float32Array<ArrayBuffer>) {
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
      let max = Number.NEGATIVE_INFINITY;
      for (let i = startIndex; i < endIndex; i++) {
        max = Math.max(max, sampleData[i]!);
      }
      return max;
    },
    getMinSampleValue(
      sampleData: Float32Array,
      startIndex: number,
      endIndex: number
    ): number {
      let min = Number.POSITIVE_INFINITY;
      for (let i = startIndex; i < endIndex; i++) {
        min = Math.min(min, sampleData[i]!);
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
        sum += Math.abs(sampleData[i]!);
      }
      return sum/(endIndex - startIndex);
    },
    drawMarker() {
      // this.canvasContext?.beginPath();
      // this.canvasContext!.strokeStyle = this.canvasMarkerColor;
      // this.canvasContext?.moveTo(this.markerPosition, 0);
      // this.canvasContext?.lineTo(this.markerPosition, this.graphHeight);
      // this.canvasContext?.stroke();

      this.canvasContext!.fillStyle = this.canvasMarkerColor;
      this.canvasContext?.fillRect(this.markerPosition, 0, 2, this.graphHeight);
    },
    drawPoint(x: number, y: number) {
      this.canvasContext!.fillStyle = this.canvasLineColor;
      this.canvasContext?.beginPath();
      this.canvasContext?.arc(x + 0.5, y + 0.5, 2, 0, Math.PI * 2);
      this.canvasContext?.fill();
    },
    drawBackground() {
      this.canvasContext?.clearRect(0, 0, this.graphWidth, this.graphHeight);
      this.canvasContext!.fillStyle = this.canvasBackgroundColor;
      this.canvasContext?.fillRect(0, 0, this.graphWidth, this.graphHeight);
    },
    drawAmplitudeMinMax() {
      const samplesPerPixel = this.zoomWindowLength / this.graphWidth;
      const binSize = Math.max(Math.round(samplesPerPixel), 1);

      this.drawBackground();

      let x = 0;
      let miny = 0;
      let maxy = 0;
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

        miny =
          this.graphHeight -
          (this.graphHeight / 2 + (min * this.graphHeight) / 2);

        maxy =
          this.graphHeight -
          (this.graphHeight / 2 + (max * this.graphHeight) / 2);

        this.canvasContext!.fillStyle = this.canvasLineColor;
        this.canvasContext?.fillRect(x, miny, 1, maxy - miny);
      }

      this.drawMarker();
    },
    drawAmplitudeSampleLine(drawSamplePoints: boolean = false) {
      const samplesPerPixel = this.zoomWindowLength / this.graphWidth;
      const binSize = Math.max(Math.round(samplesPerPixel), 1);
      const pointDistance = this.graphWidth / this.zoomWindowLength;

      this.drawBackground();

      const path = new Path2D();
      path.moveTo(0, 0);

      let x = 0;
      let y = 0;
      let amplitude = 0;

      // draw samples within the zoomWindow
      for (
        let i = this.zoomWindowStartIndex;
        i < this.zoomWindowEndIndex;
        i += binSize
      ) {
        // todo: figure out aliasing issues with the display
        amplitude = this.amplitudeData[i]!;

        x = (i - this.zoomWindowStartIndex) * pointDistance;
        y =
          this.graphHeight -
          (this.graphHeight / 2 + (amplitude * this.graphHeight) / 2);
        path.lineTo(x, y);

        if (drawSamplePoints) this.drawPoint(x, y);
      }

      path.lineTo(this.graphWidth, this.graphHeight / 2);
      this.canvasContext!.strokeStyle = this.canvasLineColor;
      this.canvasContext?.stroke(path);

      this.drawMarker();
    },
    drawAmplitudeAvg() {
      const samplesPerPixel = this.zoomWindowLength / this.graphWidth;
      const binSize = Math.max(Math.round(samplesPerPixel), 1);

      this.drawBackground();

      const path = new Path2D();
      path.moveTo(0, 0);

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

        path.moveTo(x, y);

        y =
          this.graphHeight -
          (this.graphHeight / 2 + (-avg * this.graphHeight) / 2);

        path.lineTo(x, y);
      }

      path.lineTo(this.graphWidth, this.graphHeight / 2);
      this.canvasContext!.strokeStyle = this.canvasLineColor;
      this.canvasContext?.stroke(path);

      this.drawMarker();
    },
    drawAmplitude() {
      // zoom breakpoint for drawing dots for each sample
      if (this.zoomWindowLength/this.graphWidth < 1) {
        this.drawAmplitudeSampleLine(true);
      // zoom breakpoint for plotting each sample vs using aggregate drawing method
      } else if (this.zoomWindowLength/this.graphWidth <= 2) {
        this.drawAmplitudeSampleLine(false);
      }
      else {
        // this.drawAmplitudeAvg();
        this.drawAmplitudeMinMax();
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
      const canvasX = this.canvas?.getBoundingClientRect()?.x as number;
      const xpos = e.clientX - canvasX;

      this.markerIndex =
        Math.round((xpos / this.graphWidth) * this.zoomWindowLength) +
        this.zoomWindowStartIndex;

      this.markerPosition = xpos;

      window.requestAnimationFrame(this.drawAmplitude);
      
      if (e.metaKey || e.ctrlKey) {
        this.onCanvasCtrlMouseDown(e);
      }

      // todo: else select section
    },
    onCanvasCtrlMouseDown(e: MouseEvent) {
      document!
        .getElementsByTagName("body")[0]!
        .classList.add("--no-text-select");

      window.addEventListener("mousemove", this.onCtrlClickDrag);
      window.addEventListener("mouseup", this.endCtrlClickDrag);
    },
    endCtrlClickDrag() {
      window.removeEventListener("mousemove", this.onCtrlClickDrag);
      this.prevY = -1;
      this.prevX = -1;

      document!
        .getElementsByTagName("body")[0]!
        .classList.remove("--no-text-select");
    },
    onCtrlClickDrag(e: MouseEvent) {
      const currY = e.pageY;
      const currX = e.pageX;

      // horizontal changes shift the zoom window
      const diffX = currX - this.prevX;
      // vertical changes change the zoom amount
      const diffY = currY - this.prevY;

      // pick which direction to move in
      if (Math.abs(diffX) >= Math.abs(diffY)) {
        if (this.prevX >= 0) {
          // moving to the right shifts the window left (negative direction)
          // and moving to the left shifts the window right (positive direction)
          let shiftXNumSamples =
            -Math.round((diffX / this.graphWidth) * this.zoomWindowLength);

          // don't allowing shifting out of amplitudeData range
          const minShift = -this.zoomWindowStartIndex;
          const maxShift = this.amplitudeData.length - this.zoomWindowEndIndex;

          shiftXNumSamples = clamp(shiftXNumSamples, minShift, maxShift);

          this.shiftZoomWindow(shiftXNumSamples);
          this.markerIndex += shiftXNumSamples;
        }
      } else {
        if (this.prevY >= 0) {
          this.zoom = clamp(this.zoom - (diffY / DRAG_RANGE) * 1, 0, 1);
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