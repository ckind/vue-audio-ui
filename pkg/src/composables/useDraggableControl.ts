import { ref, useTemplateRef } from "vue";


// todo: could we just get height from the dragRoot element?
export default function useDraggableControl(
  dragRootEl: string,
  height: number,
  onDrag: (knobValue: number) => any) {

  const dragRoot = useTemplateRef(dragRootEl);
  const dragRootPageY = ref(0);

  function onKnobMouseDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();

    dragRootPageY.value = (
      dragRoot.value as HTMLElement
    ).getBoundingClientRect().y;

    document.addEventListener("mousemove", onKnobMouseDrag);
    document.addEventListener("touchmove", onKnobTouchDrag);
    document.addEventListener("mouseup", onDocumentMouseUp);
    document.addEventListener("touchend", onDocumentMouseUp);
  };
  function onDocumentMouseUp() {
    document.removeEventListener("mousemove", onKnobMouseDrag);
    document.removeEventListener("touchmove", onKnobTouchDrag);
    document.removeEventListener("mouseup", onDocumentMouseUp);
    document.removeEventListener("touchend", onDocumentMouseUp);
  };

  // function onKnobDblClick() {
  //   const value =
  //     typeof this.default === "undefined" ? this.midValue : this.default;
  //   this.$emit("update:modelValue", this.valueCurve.getCurvedValue(value));
  // };

  // todo: refactor to accpet onDrag callback
  function onKnobDrag(currPageY: number) {
    let currSvgY = currPageY - dragRootPageY.value;

    if (currSvgY > height) {
      currSvgY = height;
    } else if (currSvgY < 0) {
      currSvgY = 0;
    }

    // const mult = (height - currSvgY) / height;
    // const knobValue = mult * this.valueRange + this.minValue;

    // onDrag(knobValue);

    // this.$emit(
    //   "update:modelValue",
    //   this.valueCurve.getCurvedValue(knobValue)
    // );
  };

  function onKnobTouchDrag(e: TouchEvent) {
    if (!e.touches[0]) return;
    onKnobDrag(e.touches[0].clientY);
  };

  function onKnobMouseDrag(e: MouseEvent) {
    onKnobDrag(e.clientY);
  };

  return {
    onKnobMouseDown,
    // onKnobDblClick,
  };
}

