<template>
  <div>
    <button @click="setupMatrix">Setup Matrix</button>
    <br />
    <button @click="disconnectMatrix">Disconnect Matrix</button>
    <ModMatrix :sources="sources" :destinations="destinations" />
    <v-a-oscilloscope :input="lfo1ScopeInput" :fftSize="32768" />
    <v-a-oscilloscope :input="lfo2ScopeInput" :fftSize="32768" />
    <v-a-oscilloscope :input="scopeInput" :fftSize="32768" />
    <v-a-spectrum-analyzer :input="scopeInput" :fftSize="32768" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";
import * as Tone from "tone";

import ModMatrix from "./ModMatrix.vue";
import { type ModMatrixSource, type ModMatrixDestination } from "./ModMatrix.vue";

const sources = ref<Array<ModMatrixSource>>([]);
const destinations = ref<Array<ModMatrixDestination>>([]);
const scopeInput = ref<AudioNode>();
const lfo1ScopeInput = ref<AudioNode>();
const lfo2ScopeInput = ref<AudioNode>();

const oscillators: Array<OscillatorNode> = [];

function setupMatrix() {
  const ctx = setupAudioContext();
  scopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo1ScopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo2ScopeInput.value = new GainNode(ctx, { gain: 1 });

  sources.value = [
    setupLFO(ctx, 1.5, "triangle", lfo1ScopeInput.value!),
    setupLFO(ctx, 20, "sine", lfo2ScopeInput.value)
  ];
  destinations.value = [
    // setupFilteredOscillator(ctx, 220),
    // setupFilteredOscillator(ctx, 330),
    setupSineWaveSweep(ctx, 440, 0, 1000),
    setupSineWaveSweep(ctx, 220, 0, 1000),
    // setupSineWaveSweep(ctx, 330),
  ];
}

function disconnectMatrix() {
  const ctx = setupAudioContext();

  oscillators.forEach(osc => {
    osc.stop();
    osc.disconnect();
  });

  sources.value = [];
  destinations.value = [];
}

function setupLFO(ctx: AudioContext, frequency: number, type: OscillatorType, scopeInput: AudioNode): ModMatrixSource {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.start();

  osc.connect(scopeInput);

  return { node: osc, name: `LFO ${frequency}Hz` };
}

function setupSineWaveSweep(ctx: AudioContext, frequency: number, min: number, max: number): ModMatrixDestination {
  const osc = ctx.createOscillator();

  const amp = new GainNode(ctx, { gain: 0.2 });
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(amp).connect(ctx.destination);
  osc.start();

  oscillators.push(osc);

  amp.connect(scopeInput.value!);

  return { node: osc.frequency, minValue: min, maxValue: max, name: `Sine ${frequency}Hz` };
}

function setupFilteredOscillator(ctx: AudioContext, frequency: number): ModMatrixDestination {
  const osc = ctx.createOscillator();
  // todo: cleanup on disconnect
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 20 });
  const amp = new GainNode(ctx, { gain: 0.5 });
  osc.type = "sawtooth";
  osc.frequency.value = frequency;
  osc.connect(filter).connect(amp).connect(ctx.destination);
  osc.start();

  const scale = new Tone.ScaleExp(20, 20000, 2);
  // todo: need figure out to implement this in a way that's compatible with native AudioParam
  // scale.connect(filter.frequency);

  oscillators.push(osc);

  amp.connect(scopeInput.value!);

  return { node: filter.frequency, minValue: 20, maxValue: 20000, name: `Filtered Osc ${frequency}Hz` };
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
