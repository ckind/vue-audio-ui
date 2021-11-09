<template>
  <canvas ref="graph" :width="graphWidth" :height="graphHeight" />
  <v-a-fader :minValue="minVal" :maxValue="maxVal" v-model="val" />
  <v-a-fader :minValue="-20" :maxValue="20" v-model="curveAmount" />
  <p>value: {{ val }}</p>
  <p>curved value: {{ curvedVal }}</p>
  <p>curved amount: {{ curveAmount }}</p>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  CurvedRange,
  LinearCurvedRange,
  LogCurvedRange,
  Pow2CurvedRange,
} from "../src/util/curved-range";

const minVal = 1;
const maxVal = 1000;
const curveAmt = 2.71;

export default defineComponent({
  name: "CurveGraph",
  data() {
    return {
      graphWidth: 200,
      graphHeight: 200,
      minVal: minVal,
      maxVal: maxVal,
      val: minVal,
      curvedVal: minVal,
      ctx: null as null | CanvasRenderingContext2D,
      curve: null as CurvedRange | null,
      curveAmount: curveAmt,
      curveType: "log",
    };
  },
  mounted() {
    this.ctx = (this.$refs.graph as HTMLCanvasElement).getContext("2d");
		this.curve = this.getCurvedRange();
    this.plot(this.val, this.curvedVal);
  },
  methods: {
    getCurvedRange(): CurvedRange {
      if (this.curveType === "log") {
        return new LogCurvedRange(minVal, maxVal, curveAmt);
      } else if (this.curveType === "pow2") {
        return new Pow2CurvedRange(minVal, maxVal);
      } else {
        return new LinearCurvedRange(minVal, maxVal);
      }
    },
    plot(val: number, curvedVal: number) {
      if (this.curve && this.ctx) {
        this.ctx.clearRect(0, 0, this.graphWidth, this.graphHeight);

        // draw curve - todo: don't have to recompute this every time
        this.ctx.strokeStyle = "black";
        for (let i = 0; i < this.graphWidth; i++) {
          const x = i;
          const v = (i / this.graphWidth) * (this.maxVal - this.minVal) + this.minVal;
          const y = Math.round(
            (this.curve.getCurvedValue(v) / (this.maxVal - this.minVal)) *
              this.graphHeight
          );

          this.ctx.beginPath();
          this.ctx.arc(x, this.graphHeight - y, 1, 0, 2 * Math.PI, true);
          this.ctx.stroke();
        }

        const x = Math.round(
          (val / (this.maxVal - this.minVal)) * this.graphWidth
        );
        const y = Math.round(
          (curvedVal / (this.maxVal - this.minVal)) * this.graphWidth
        );

        this.ctx.strokeStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(x, this.graphHeight - y, 5, 0, 2 * Math.PI, true);
        this.ctx.stroke();
      }
    },
  },
  watch: {
    val(newVal: number) {
      if (this.curve) {
        this.curvedVal = this.curve.getCurvedValue(newVal);
        this.plot(newVal, this.curvedVal);
      }
    },
    curveAmount(newVal: number) {
      this.curve = new LogCurvedRange(this.minVal, this.maxVal, newVal);
      this.curvedVal = this.curve.getCurvedValue(this.val);
      this.plot(this.val, this.curvedVal);
    },
  },
});
</script>