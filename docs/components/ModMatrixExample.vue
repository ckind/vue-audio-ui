<template>
  <div>
    <button @click="handleClick">Setup Matrix</button>
    <ModMatrix :sources="sources" :destinations="destinations" />
    <v-a-oscilloscope :input="scopeInput" :fftSize="32768" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VANumBox } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

import ModMatrix from "./ModMatrix.vue";

const sources = ref<Array<AudioNode>>([]);
const destinations = ref<Array<AudioParam>>([]);
const scopeInput = ref<AudioNode>();

function handleClick() {
    const ctx = setupAudioContext();

    sources.value = [
      setupLFO(ctx, 2),
      // setupLFO(ctx, 4)
    ];
    destinations.value = [
      setupDestinationOscillator(ctx, 220),
      // setupDestinationOscillator(ctx, 330)
    ];
}

function setupLFO(ctx: AudioContext, frequency: number): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = frequency;
  osc.start();

  scopeInput.value = osc;

  return osc;
}

function setupDestinationOscillator(ctx: AudioContext, frequency: number): AudioParam {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(new GainNode(ctx, { gain: 0.5 })).connect(ctx.destination);
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
