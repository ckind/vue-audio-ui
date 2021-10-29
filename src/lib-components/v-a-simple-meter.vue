<template>
  <canvas class="meter" ref="meterCanvas" height="200" width="20" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import useMetering from "@/composables/metering";
import useRendering from "@/composables/rendering";

type MeterType = "peak" | "rms";

export default defineComponent({
  name: "VASimpleMeter",
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
    type: {
      required: false,
      type: String as PropType<MeterType>,
      default: "peak"
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048
    },
  },
  setup(props) {
    const input = props.input as AudioNode;

    return {
      ...useMetering(input.context, props.fftSize),
      ...useRendering()
    }
  },
  data() {
    return {
      height: 200,
      width: 20,
      canvasCxt: null as CanvasRenderingContext2D | null
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

        let mult = 0;

        if (this.type === "peak") {
          mult = this.getPeak(dataArray);
        } else if (this.type === "rms") {
          mult = this.getRms(dataArray);
        }

        const meterHeight = this.height * mult;

        this.canvasCxt.clearRect(0, 0, this.width, this.height);

        this.canvasCxt.fillStyle = "black";
        this.canvasCxt.beginPath();
        this.canvasCxt.fillRect(
          0,
          this.height - meterHeight,
          this.width,
          meterHeight
        );
        this.canvasCxt.stroke();
      }
    },
  },
});
</script>

<style scoped>

</style>
