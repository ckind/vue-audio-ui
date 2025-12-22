<template>
  <div>
    <div class="piano">
      <v-a-piano @keyMouseDown="onKeyDown" @keyMouseUp="onKeyUp" @keySlideOn="onKeySlideOn" @keySlideOff="onKeySlideOff" :octaves="2"/>
    </div>

    <div>
      <label for="lastEvent">Last Event: </label>
      <span id="lastEvent" name="lastEvent"> {{ lastEvent }}</span>
    </div>


    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import VAPiano from './v-a-piano.vue';
import PropsTable from "./PropsTable.vue";

const disabled = ref(false);
const lastEvent = ref('');

const propsToDisplay = ref([
  { name: 'disabled', type: 'Boolean', default: 'false', description: 'Disables the piano keyboard' }
]);

function onKeyDown(keyNumber) {
  lastEvent.value = `Key Down: ${keyNumber}`;
}

function onKeyUp(keyNumber) {
  lastEvent.value = `Key Up: ${keyNumber}`;
}

function onKeySlideOn(keyNumber) {
  lastEvent.value = `Key Slide On: ${keyNumber}`;
}

function onKeySlideOff(keyNumber) {
  lastEvent.value = `Key Slide Off: ${keyNumber}`;
}
</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.piano {
  flex: 0 0 auto;
}
</style>