<template>
  <div>
    <button class="mute-btn" @click="toggleMute">{{ isMuted ? "Unmute" : "Mute" }}</button>
    <br />
    <v-a-mod-matrix :sources="sources" :destinations="destinations" />

    <!-- <v-a-oscilloscope :input="lfo1ScopeInput" :fftSize="32768" />
    <v-a-oscilloscope :input="lfo2ScopeInput" :fftSize="32768" />
    <v-a-oscilloscope :input="mainOutput" :fftSize="32768" />
    <v-a-spectrum-analyzer :input="mainOutput" :fftSize="32768" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

import { type ModMatrixSource, type ModMatrixDestination } from "vue-audio-ui";

const sources = ref<Array<ModMatrixSource>>([]);
const destinations = ref<Array<ModMatrixDestination>>([]);
const lfo1ScopeInput = ref<AudioNode>();
const lfo2ScopeInput = ref<AudioNode>();
const oscillators: Array<OscillatorNode> = [];
const mainOutput = ref<GainNode>();
const isMuted = ref(true);

onMounted(() => {
  setupMatrix();
});

onUnmounted(() => {
  disconnectMatrix();
});

function toggleMute() {
  const gain = mainOutput.value!.gain;
  const ctx = mainOutput.value!.context;
  if (mainOutput.value!.gain.value === 0) {
    isMuted.value = false;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.01);

  } else {
    isMuted.value = true;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.01);
  }
}

function setupMatrix() {
  const ctx = setupAudioContext();
  mainOutput.value = new GainNode(ctx, { gain: 0 });
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

  mainOutput.value!.connect(ctx.destination);
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
  osc.connect(amp).connect(mainOutput.value!);
  osc.start();

  oscillators.push(osc);

  return { node: osc.frequency, minValue: min, maxValue: max, name: `Sine ${frequency}Hz` };
}

function setupFilteredOscillator(ctx: AudioContext, frequency: number): ModMatrixDestination {
  const osc = ctx.createOscillator();
  // todo: cleanup on disconnect
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 20 });
  const amp = new GainNode(ctx, { gain: 0.5 });
  osc.type = "sawtooth";
  osc.frequency.value = frequency;
  osc.connect(filter).connect(amp).connect(mainOutput.value!);
  osc.start();

  // todo: need figure out to implement this in a way that's compatible with native AudioParam
  // scale.connect(filter.frequency);

  oscillators.push(osc);

  return { node: filter.frequency, minValue: 20, maxValue: 20000, name: `Filtered Osc ${frequency}Hz` };
}

</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.mute-btn {
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
}
</style>
