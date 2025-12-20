<template>
  <div class="control-container">
    <div class="knob-row">
      <!-- default knob -->
      <span @mousedown="onKnobMouseDown" @touchstart="onKnobMouseDown" @dblclick="onKnobDblClick" class="knob-container"
        :style="`transform: rotate(${knobRotation}rad); width: ${size}px; height: ${size}px;`">
        <slot>
          <default-knob />
        </slot>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { LinearCurvedRange } from "@/util/curved-range";
import { fitToBounds } from "@/util/math-helpers";
import defaultKnob from "@/lib/components/default-knob.vue";
import { type PropType } from "vue";

// type CurveType = "linear" | "exp";
type KnobModelValueType = number | AudioParam;

export default defineComponent({
  components: {
    defaultKnob
  },
  setup(props) {
    const state = {
      curvedValue: 0,
      linearValue: 0,
      unsteppedValue: 0,
      rotationMax: (3 * Math.PI) / 4,
      dragRange: 70,
      prevY: -1,
      valueCurve: new LinearCurvedRange(props.minValue, props.maxValue),
      // audioParamValue: null as AudioParam | null
    };

    if (props.modelValue instanceof Number) {
      state.linearValue = props.modelValue as number;
      state.curvedValue = state.valueCurve.getCurvedValue(props.modelValue as number);
      state.unsteppedValue = state.curvedValue;
    }
    // else if (props.modelValue instanceof AudioParam) {
    //   // todo: should we do two way data binding with this? additive patching?

    //   const audioParam = props.modelValue as AudioParam;

    //   state.linearValue = props.default
    //     ? props.default
    //     : (props.maxValue - props.minValue)/2;
    //   state.curvedValue = state.valueCurve.getCurvedValue(audioParam.value);
    //   state.unsteppedValue = state.curvedValue;

    //   state.audioParamValue = new AudioParam();
    //   state.audioParamValue.connect(audioParam);
    // }

    return reactive(state);
  },
  props: {
    modelValue: {
      required: true,
      type: Number as PropType<KnobModelValueType>,
    },
    minValue: {
      required: true,
      type: Number,
    },
    maxValue: {
      required: true,
      type: Number,
    },
    step: {
      required: false,
      type: Number,
      default: 0,
    },
    size: {
      required: false,
      type: Number,
      default: 60,
    },
    default: {
      required: false,
      type: Number
    },
  },
  computed: {
    knobRotation(): number {
      const offset = this.linearValue - this.midValue;
      return (offset / (this.valueRange / 2)) * this.rotationMax;
    },
    midValue(): number {
      return this.minValue + this.valueRange / 2;
    },
    valueRange(): number {
      return this.maxValue - this.minValue;
    }
  },
  methods: {
    onKnobMouseDown(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      document.addEventListener("mousemove", this.onKnobMouseDrag);
      document.addEventListener("touchmove", this.onKnobTouchDrag);
      document.addEventListener("mouseup", this.onDocumentMouseUp);
      document.addEventListener("touchend", this.onDocumentMouseUp);
    },
    onDocumentMouseUp() {
      document.removeEventListener("mousemove", this.onKnobMouseDrag);
      document.removeEventListener("touchmove", this.onKnobTouchDrag);
      document.removeEventListener("mouseup", this.onDocumentMouseUp);
      document.removeEventListener("touchend", this.onDocumentMouseUp);
      this.prevY = -1;
    },
    onKnobDblClick() {
      const value =
        typeof this.default === "undefined" ? this.midValue : this.default;
      this.unsteppedValue = value;
      this.$emit("update:modelValue", this.valueCurve.getCurvedValue(value));
    },
    roundToStep(x: number) {
      if (this.step === 0) {
        throw "step is zero or undefined";
      }
      const roundedValue = Math.round(x / this.step) * this.step;

      return fitToBounds(roundedValue, this.minValue, this.maxValue);
    },
    onKnobDrag(currY: number) {
      if (this.prevY >= 0) {
        const diffY = this.prevY - currY;
        let knobValue = this.unsteppedValue +
          (diffY / this.dragRange) * (this.valueRange / 2);
        knobValue = fitToBounds(knobValue, this.minValue, this.maxValue);

        this.unsteppedValue = knobValue;
        const steppedValue =
          this.step === 0
            ? this.unsteppedValue
            : this.roundToStep(this.unsteppedValue);
        this.$emit(
          "update:modelValue",
          this.valueCurve.getCurvedValue(steppedValue)
        );
      }
    },
    onKnobTouchDrag(e: TouchEvent) {
      if (e.touches[0]) {
        this.onKnobDrag(e.touches[0].pageY);
        this.prevY = e.touches[0].pageY;
      }

    },
    onKnobMouseDrag(e: MouseEvent) {
      this.onKnobDrag(e.pageY);
      this.prevY = e.pageY;
    },
  },
  watch: {
    modelValue(newValue: number): void {
      this.curvedValue = newValue;
      this.unsteppedValue = this.valueCurve.getLinearValue(this.curvedValue);
      this.linearValue =
        this.step === 0
          ? this.unsteppedValue
          : this.roundToStep(this.unsteppedValue);
    },
  },
});
</script>

<style scoped>
.knob-row {
  justify-content: center;
  display: flex;
}

.knob-shadow {
  -webkit-box-shadow: 0px 0px 8px var(--shadowColor);
  box-shadow: 0px 0px 8px var(--shadowColor);
}

.knob-container {
  border-radius: 50%;
  line-height: 0px !important;
  cursor: move;
}

.knob-container ::v-deep svg {
  /* This makes the SVG fill the container */
  width: 100% !important;
  height: auto !important;
  /* Ensures the aspect ratio is preserved */
  display: block;
  /* Removes default inline spacing issues */
}

.knob-container ::v-deep img {
  /* This makes the SVG fill the container */
  width: 100% !important;
  height: auto !important;
  /* Ensures the aspect ratio is preserved */
  display: block;
  /* Removes default inline spacing issues */
}

.control-container {
  display: inline-block;
}
</style>
