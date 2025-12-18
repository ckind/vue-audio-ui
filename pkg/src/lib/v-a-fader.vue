<template>
  <div ref="faderContainer" class="fader-container" :style="cssVars">
    <div ref="faderBackground" class="fader-background">
      <slot name="faderBackground">
        <defaultFaderBackground />
      </slot>
    </div>
    <div ref="faderHead" class="fader-head" @mousedown="onHeadMouseDown" @touchstart="onHeadMouseDown"
      @dblclick="onHeadDblClick">
      <slot name="faderHead">
        <defaultFaderHead />
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useTemplateRef } from "vue";
import defaultFaderHead from "@/lib/components/default-fader-head.vue";
import defaultFaderBackground from "./components/default-fader-background.vue";
import { LinearCurvedRange } from "@/util/curved-range";

export default defineComponent({
  name: "VAFader",
  components: {
    defaultFaderHead,
    defaultFaderBackground
  },
  emits: ['update:modelValue'],
  setup(props) {
    const valueCurve = ref(new LinearCurvedRange(props.minValue, props.maxValue));
    const faderContainerY = ref(0);
    const linearValue = ref(props.modelValue);
    const curvedValue = ref(valueCurve.value.getCurvedValue(props.modelValue));

    // const faderContainer = useTemplateRef("fader-container");
    // const faderBackground = useTemplateRef("fader-background");
    // const faderHead = useTemplateRef("fader-head");
    const faderHeadHeight = ref(0);

    return {
      valueCurve,
      faderContainerY,
      linearValue,
      curvedValue,

      // faderContainer,
      // faderBackground,
      // faderHead,
      faderHeadHeight
    };
  },
  props: {
    modelValue: {
      required: true,
      type: Number,
    },
    minValue: {
      required: true,
      type: Number,
    },
    maxValue: {
      required: true,
      type: Number,
    },
    height: {
      required: false,
      type: Number,
      default: 200,
    },
    width: {
      required: false,
      type: Number,
      default: 46,
    },
    default: {
      required: false,
      type: Number,
    },
  },
  computed: {
    midValue(): number {
      return this.minValue + this.valueRange / 2;
    },
    valueRange(): number {
      return this.maxValue - this.minValue;
    },
    faderDragRange(): number {
      return Math.abs(this.height - this.faderHeadHeight);
    },
    faderHeadTop(): number {
      // set top position prop of fader head based on value of control
      // need to invert so highest value is top: 0
      return this.faderDragRange - ((this.linearValue * this.maxValue) * this.faderDragRange);
    },
    cssVars() {
      return {
        "--fader-height": `${this.height}px`,
        "--fader-width": `${this.width}px`,
        "--fader-head-top": `${this.faderHeadTop}px`
      }
    }
  },
  methods: {
    getContainedImgOrSvg(el: HTMLElement) {
      if (el.children.length == 1) {
        if (el.children.item(0) instanceof SVGElement) {
          return el.children.item(0);
        } else if (el.children.item(0) instanceof HTMLImageElement) {
          return el.children.item(0);
        }
      }

      return undefined;
    },
    onHeadMouseDown(e: MouseEvent | TouchEvent) {
      e.preventDefault();

      // todo: should access this via comp api instead of using $refs
      this.faderContainerY = (
        this.$refs.faderContainer as HTMLElement
      ).getBoundingClientRect().y;
      const faderHead = this.$refs.faderHead as HTMLElement;

      // look for underlying img or svg to get exact height
      // todo: could probably just get the container height
      // to match the img or svg height exactly with proper css
      const headImg = this.getContainedImgOrSvg(faderHead);

      this.faderHeadHeight = headImg ? headImg.getBoundingClientRect().height :
        faderHead.getBoundingClientRect().height;

      document.addEventListener("mousemove", this.onHeadMouseDrag);
      document.addEventListener("touchmove", this.onHeadTouchDrag);
      document.addEventListener("mouseup", this.onDocumentMouseUp);
      document.addEventListener("touchend", this.onDocumentMouseUp);
    },
    onDocumentMouseUp() {
      document.removeEventListener("mousemove", this.onHeadMouseDrag);
      document.removeEventListener("touchmove", this.onHeadTouchDrag);
      document.removeEventListener("mouseup", this.onDocumentMouseUp);
      document.removeEventListener("touchend", this.onDocumentMouseUp);
    },
    onHeadDblClick() {
      const value =
        typeof this.default === "undefined" ? this.midValue : this.default;
      this.$emit("update:modelValue", this.valueCurve.getCurvedValue(value));
    },
    onHeadDrag(currPageY: number) {
      let currSvgY = currPageY - this.faderContainerY;

      if (currSvgY > this.height) {
        currSvgY = this.height;
      } else if (currSvgY < 0) {
        currSvgY = 0;
      }

      const mult = (this.height - currSvgY) / this.height;
      const faderValue = mult * this.valueRange + this.minValue;

      this.$emit(
        "update:modelValue",
        this.valueCurve.getCurvedValue(faderValue)
      );
    },
    onHeadTouchDrag(e: TouchEvent) {
      if (e.touches[0])
        this.onHeadDrag(e.touches[0].clientY);
    },
    onHeadMouseDrag(e: MouseEvent) {
      this.onHeadDrag(e.clientY);
    },
  },
  watch: {
    modelValue(newValue: number): void {
      this.curvedValue = newValue;
      this.linearValue = this.valueCurve.getLinearValue(this.curvedValue);
    },
    minValue(newValue: number) {
      this.valueCurve = new LinearCurvedRange(newValue, this.maxValue);
    },
    maxValue(newValue: number) {
      this.valueCurve = new LinearCurvedRange(this.minValue, newValue);
    },
  },
});
</script>

<style scoped>
.fader-container {
  width: var(--fader-width);
  height: var(--fader-height);
  position: relative;
  /* display: inline-block; */
}

.fader-head {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
  cursor: move;
  position: absolute;
  top: var(--fader-head-top);
  left: 50%;
  translate: -50% 0;
}

.fader-head ::v-deep img {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
  display: block;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}

.fader-head ::v-deep svg {
  max-width: var(--fader-width);
  max-height: var(--fader-height);
}

.fader-background {
  width: var(--fader-width);
  height: var(--fader-height);
  position: absolute;
}

.fader-background ::v-deep img {
  width: 100% !important;
  height: 100% !important;
  display: block;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}

.fader-background ::v-deep svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.spacer {
  width: var(--fader-width);
  height: var(--fader-height);
  visibility: hidden;
}
</style>