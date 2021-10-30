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
import useMetering from "@/composables/metering";
import useRendering from "@/composables/rendering";
import { MeterType } from "@/types/v-audio-ui-types";

const DB_RANGE = 80;
// const MARKER_WIDTH = 8;

export default defineComponent({
  name: "VADigitalMeter",
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
    type: {
      required: false,
      type: String as PropType<MeterType>,
      default: "peak",
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048,
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
  },
  computed: {
    canvasWidth(): number {
      return this.width + (this.drawMarkers ? 40 : 0);
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
    draw(): void {
      if (this.canvasCxt) {
        const dataArray = this.getFloatTimeDomainData();

        let db = 0;

        if (this.type === "peak") {
          db = this.getPeakDb(dataArray);
        } else if (this.type === "rms") {
          db = this.getRmsDb(dataArray);
        }

        db = db < -DB_RANGE ? -DB_RANGE : db;
        const mult = (DB_RANGE + db) / DB_RANGE;

        const meterHeight = this.height * mult;

        this.canvasCxt.clearRect(0, 0, this.canvasWidth, this.height);

        this.canvasCxt.fillStyle = "#E3E3E3";
        this.canvasCxt.beginPath();
        this.canvasCxt.fillRect(
          0,
          0,
          this.width,
          this.height
        );
        this.canvasCxt.stroke();

        this.canvasCxt.fillStyle = "black";
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
      this.drawDbMarker(0);
      this.drawDbMarker(-10);
      this.drawDbMarker(-20);
      this.drawDbMarker(-30);
      this.drawDbMarker(-40);
      this.drawDbMarker(-50);
      this.drawDbMarker(-60);
      this.drawDbMarker(-70);
      this.drawDbMarker(-80);
    },
    drawDbMarker(db: number): void {
      const y = this.height - ((DB_RANGE + db) / DB_RANGE) * this.height;
      const x = this.width + 4;

      this.canvasCxt!.lineWidth = 1;
      this.canvasCxt!.strokeStyle = "gray";

      this.canvasCxt!.font = "10px Arial";
      this.canvasCxt!.fillStyle = "gray";
      this.canvasCxt!.fillText(`${db}db`, x, y);


      // this.canvasCxt?.beginPath();
      // this.canvasCxt?.moveTo(x, y);
      // this.canvasCxt?.lineTo(x + MARKER_WIDTH, y);
      // this.canvasCxt?.stroke();
    },
  },
});
</script>

<style scoped>
</style>
