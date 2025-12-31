import { ref } from "vue";

export default function useDragging(
  dragCallback: (deltaX: number, deltaY: number) => any
) {
  const prevY = ref(-1);
  const prevX = ref(-1);
  const dragging = ref(false);

  function onDragElementStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    document.addEventListener("mousemove", onMouseDrag);
    document.addEventListener("touchmove", onTouchDrag);
    document.addEventListener("mouseup", onDocumentUp);
    document.addEventListener("touchend", onDocumentUp);
  }
  function onDocumentUp() {
    document.removeEventListener("mousemove", onMouseDrag);
    document.removeEventListener("touchmove", onTouchDrag);
    document.removeEventListener("mouseup", onDocumentUp);
    document.removeEventListener("touchend", onDocumentUp);
    prevY.value = -1;
    prevX.value = -1;
    dragging.value = false;
  }
  function onMouseDrag(e: MouseEvent) {
    onDrag(e.pageX, e.pageY);
    prevY.value = e.pageY;
    prevX.value = e.pageX;
  }
  function onTouchDrag(e: TouchEvent) {
    if (e.touches[0]) {
      onDrag(e.touches[0].pageX, e.touches[0].pageY);
      prevY.value = e.touches[0].pageY;
      prevX.value = e.touches[0].pageX;
    }
  }
  function onDrag(currX: number, currY: number) {
    dragging.value = true;
    if (prevY.value > -1) {
      const deltaX = currX - prevX.value;
      const deltaY = currY - prevY.value;

      dragCallback(deltaX, deltaY);
    }
  }

  return {
    onDragElementStart,
    dragging
  };
}
