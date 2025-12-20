<template>
  <div>
    <ModMatrix :sources="sources" :destinations="destinations" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VANumBox } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

import ModMatrix from "./ModMatrix.vue";

const sources = ref<Array<AudioNode>>([]);
const destinations = ref<Array<AudioNode>>([]);

onMounted(() => {
  const ctx = setupAudioContext();

  sources.value = [null, null, null, null].map((x) => setupLFO(ctx));
  destinations.value = [null, null, null].map((x) => setupDestinationOscillator(ctx));
});

function setupLFO(ctx: AudioContext): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = (Math.random() * 10) + 1;
  osc.start();

  return osc;
}

function setupDestinationOscillator(ctx: AudioContext): AudioParam {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 220 * Math.pow(2, Math.floor(Math.random() * 4));
  console.log(osc.frequency.value);
  osc.connect(ctx.destination);
  osc.start();

  return osc.frequency;
}

</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.knob {
  flex: 0 0 auto;
}

.props {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.props input {
  width: 9rem;
}
</style>
