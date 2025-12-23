<template>
  <div :class="['keyboard', disabled ? 'disabled' : '']">
    <div v-for="octave in numOctaves" :key="octave" class="octave-section" >
      <!-- todo: use v-for for keys? -->
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 0}`" class="key">
        <div :id="`key${startingOctave*12 + (octave-1)*12 + 1}`" class="black-key"></div>
      </div>
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 2}`" class="key">
        <div :id="`key${startingOctave*12 + (octave-1)*12 +3}`"  class="black-key"></div>
      </div>
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 4}`"  class="key"></div>
      <div :id="`key${startingOctave*12 + (octave-1)*12+ 5}`"  class="key">
        <div :id="`key${startingOctave*12 + (octave-1)*12 + 6}`"  class="black-key"></div>
      </div>
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 7}`"  class="key">
        <div :id="`key${startingOctave*12 + (octave-1)*12 + 8}`" class="black-key"></div>
      </div>
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 9}`"  class="key">
        <div :id="`key${startingOctave*12 + (octave-1)*12 + 10}`"  class="black-key"></div>
      </div>
      <div :id="`key${startingOctave*12 + (octave-1)*12 + 11}`"  class="key"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";

const isMouseDown = ref(false);

export interface IDomPiano {
  displayKeyDown(keyNumber: number): void;
  displayKeyUp(keyNumber: number): void;
}

export default defineComponent({
  emits: [
    "keySlideOn",
    "keySlideOff",
    "keyMouseDown",
    "keyMouseUp",
    "keyboardKeyDown",
    "keyboardKeyUp"
  ],
  props: {
    disabled: { type: Boolean, required: false, default: false },
    enableKeyControls: { type: Boolean, required: false, default: true },
    startingOctave: { type: Number, required: false, default: 3 },
    numOctaves: { type: Number, required: false, default: 2 },
    enableKeyboardControls: { type: Boolean, required: false, default: true }
  },
  setup(props, context) {
    const keyPressedColor = "#ff2929"; // todo: use theme color (danger?)
    const blackKeys = [1, 3, 6, 8, 10];
    const noteKeyCodes = [
      "KeyA",
      "KeyW",
      "KeyS",
      "KeyE",
      "KeyD",
      "KeyF",
      "KeyT",
      "KeyG",
      "KeyY",
      "KeyH",
      "KeyU",
      "KeyJ",
      "KeyK",
      "KeyO",
      "KeyL",
    ];
    let userOctaveOffset = props.startingOctave * 12;

    function userKeyPressed(e: KeyboardEvent) {
      const n = noteKeyCodes.findIndex((c) => {
        return c === e.code;
      });
      if (n > -1) {
        const keyNum = n + userOctaveOffset;
        displayKeyDown(keyNum);
        context.emit("keyboardKeyDown", keyNum);
      }
    }

    function userKeyReleased(e: KeyboardEvent) {
      const n = noteKeyCodes.findIndex((c) => {
        return c === e.code;
      });
      if (n > -1) {
        // todo: doesn't release if you change octave or transpose while holding a key
        const keyNum = n + userOctaveOffset
        displayKeyUp(keyNum);
        context.emit("keyboardKeyUp", keyNum);
      } else if (e.code === "KeyZ") {
        // go down an octave
        userOctaveOffset -= 12;
      } else if (e.code === "KeyX") {
        // go up an octave
        userOctaveOffset += 12;
      } else if (e.code === "KeyC") {
        // todo: transpose down a step?
      } else if (e.code === "KeyV") {
        // todo: transpose up a step?
      }
    }

    function displayKeyDown(keyNumber: number) {
      const key: HTMLElement | null = document.querySelector(`#key${keyNumber}`);
      if (key != null) {
        key.style.background = keyPressedColor;
      }
    }

    function displayKeyUp(keyNumber: number) {
      const key: HTMLElement | null = document.querySelector(`#key${keyNumber}`);
      if (key != null) {
        key.style.background = blackKeys.includes(keyNumber % 12)
          ? "black"
          : "white";
      }
    }

    function getKeyNum(e: Event) {
      const el = e.target as HTMLElement;
      return parseInt(el.id.replace("key", ""));
    }

    function keySlideOn(e: Event) {
      if (!isMouseDown.value) return;

      const keyNum = getKeyNum(e);
      e.stopPropagation();
      if (!props.disabled) {
        displayKeyDown(keyNum);
        context.emit("keySlideOn", keyNum)
      }
    }

    function keySlideOff(e: Event) {
      if (!isMouseDown.value) return;

      e.stopPropagation();
      const keyNum = getKeyNum(e);
      if (!props.disabled) {
        displayKeyUp(keyNum);
        context.emit("keySlideOff", keyNum);
      }
    }

    function keyMouseDown(e: Event) {
      e.stopPropagation();
      isMouseDown.value = true;
      const keyNum = getKeyNum(e);
      if (!props.disabled) {
        displayKeyDown(keyNum);
        context.emit("keyMouseDown", keyNum);
      }
    }

    function keyMouseUp(e: Event) {
      e.stopPropagation();
      isMouseDown.value = false;
      const keyNum = getKeyNum(e);
      if (!props.disabled) {
        displayKeyUp(keyNum);
        context.emit("keyMouseUp", getKeyNum(e));
      }
    }

    function documentMouseDown() {
      isMouseDown.value = true;
    }

    function documentMouseUp() {
      isMouseDown.value = false;
    }

    function assignKeyboardListeners() {
      document.addEventListener("mousedown", documentMouseDown);
      document.addEventListener("mouseup", documentMouseUp);

      document.addEventListener("keydown", userKeyPressed);
      document.addEventListener("keyup", userKeyReleased);

      const keys = document.querySelectorAll(
        "div.keyboard div.key, div.keyboard div.black-key"
      );
      for (const key of keys) {
        key.addEventListener("mousedown", keyMouseDown);
        key.addEventListener("mouseup", keyMouseUp);
        key.addEventListener("mouseover", keySlideOn);
        key.addEventListener("mouseout", keySlideOff);
        key.addEventListener("touchstart", keyMouseDown);
        key.addEventListener("touchend", keyMouseUp);
        // todo: need to implement keySlideOn and keySlideOff for touch events - see: https://gist.github.com/VehpuS/6fd5dca2ea8cd0eb0471
      }
    }

    function clearKeyboardListeners() {
      document.removeEventListener("mousedown", documentMouseDown);
      document.removeEventListener("mouseup", documentMouseUp);

      document.removeEventListener("keydown", userKeyPressed);
      document.removeEventListener("keyup", userKeyReleased);

      const keys = document.querySelectorAll(
        "div.keyboard div.key, div.keyboard div.black-key"
      );
      for (const key of keys) {
        key.removeEventListener("mousedown", keyMouseDown);
        key.removeEventListener("mouseup", keyMouseUp);
        key.removeEventListener("mouseover", keySlideOn);
        key.removeEventListener("mouseout", keySlideOff);
        key.removeEventListener("touchstart", keyMouseDown);
        key.removeEventListener("touchend", keyMouseUp);
      }
    }

    function resetKeyboardListeners() {
      clearKeyboardListeners();
      assignKeyboardListeners();
    }

    onMounted(() => {
      assignKeyboardListeners();
    });

    onBeforeUnmount(() => {
      clearKeyboardListeners();
    });

    watch(() => props.numOctaves, resetKeyboardListeners);
  },
});
</script>

<style scoped>
/* keyboard */
.keyboard {
  padding-left: 0px;
  border-radius: 5px; /* should be the same as .key */
  height: 140px;
}
.keyboard .key {
  position: relative;
  width: 30px;
  height: 130px;
  border: 1px solid black;
  border-right: none;
  background: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  display: inline-block;
}
.keyboard.disabled .key {
  cursor: default;
}
.keyboard .black-key {
  position: absolute;
  top: -1px;
  left: 20px;
  width: 20px;
  height: 80px;
  background: black;
  border-radius: 5px;
  box-shadow: 0px 3px 5px #666;
  z-index: 2;
  user-select: none;
  display: inline-block;
}
.keyboard > .key:last-child {
  border-right: 1px solid black;
}
.octave-section {
  display: inline-block;
}
</style>