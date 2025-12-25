<template>
  <div>
    <p>Here is a simple filtered sawtooth patch with 3 different LFO's for modulation.</p>
    <button class="mute-btn" @click="toggleMute">{{ isMuted ? "Unmute" : "Mute" }}</button>
    <br />
    <v-a-mod-matrix :sources="sources" :destinations="destinations" />

    <v-a-oscilloscope :input="lfo1ScopeInput" :fftSize="32768" />
    <v-a-oscilloscope :input="lfo2ScopeInput" :fftSize="32768" />
    <!-- <v-a-oscilloscope :input="mainOutput" :fftSize="32768" /> -->
    <v-a-spectrum-analyzer :input="mainOutput" :fftSize="32768" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";
import { type ModMatrixSource, type ModMatrixDestination } from "vue-audio-ui";
import { ScalerNode } from "../helpers/web-audio-extensions.ts";

const sources = ref<Array<ModMatrixSource>>([]);
const destinations = ref<Array<ModMatrixDestination>>([]);
const nodes: Array<AudioNode> = [];
const mainOutput = ref<GainNode>();
const isMuted = ref(false);

const lfo1ScopeInput = ref<AudioNode>();
const lfo2ScopeInput = ref<AudioNode>();
const lfo3ScopeInput = ref<AudioNode>();

onMounted(() => {
  setupMatrix();
});

onUnmounted(() => {
  disconnectMatrix();
});

function toggleMute() {
  const gain = mainOutput.value!.gain;
  const ctx = mainOutput.value!.context;
  if (isMuted.value) {
    isMuted.value = false;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
  } else {
    isMuted.value = true;
    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.01);
  }
}

function setupMatrix() {
  const ctx = setupAudioContext();
  mainOutput.value = new GainNode(ctx, { gain: isMuted.value ? 0 : 1 });

  lfo1ScopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo2ScopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo3ScopeInput.value = new GainNode(ctx, { gain: 1 });

  sources.value = [
    setupLFO(ctx, 1, "triangle", lfo1ScopeInput.value!, "LFO 1", true),
    setupLFO(ctx, 1, "triangle", lfo2ScopeInput.value, "LFO 2"),
    setupLFO(ctx, 0.1, "sine", lfo3ScopeInput.value!, "LFO 3"),
  ];
  destinations.value = [
    ...setupFilteredOscillator(ctx, 100)
  ];

  mainOutput.value!.connect(ctx.destination);
}

function disconnectMatrix() {
  nodes.forEach(node => {
    if (node instanceof OscillatorNode) {
      node.stop();
    }
    node.disconnect();
  });

  sources.value = [];
  destinations.value = [];
}

function setupLFO(ctx: AudioContext, frequency: number, type: OscillatorType, scopeInput?: AudioNode, name?: string, useScaler: boolean = false): ModMatrixSource {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.start();

  nodes.push(osc);

  if (useScaler) {
    const scaler = new ScalerNode(ctx, (n, i) => Math.pow(i, 2), true);
    nodes.push(scaler);
    if (scopeInput) {
      osc.connect(scaler).connect(scopeInput);
    }
    return { node: scaler, name: name ?? `LFO ${frequency}Hz` };
  } else {
    if (scopeInput) {
      osc.connect(scopeInput);
    }
    return { node: osc, name: name ?? `LFO ${frequency}Hz` };
  }
}

function setupFilteredOscillator(ctx: AudioContext, frequency: number): Array<ModMatrixDestination> {
  const osc = ctx.createOscillator();
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 20 });
  const amp = new GainNode(ctx, { gain: 0 });
  osc.type = "sawtooth";
  osc.frequency.value = frequency;
  osc.connect(filter).connect(amp).connect(mainOutput.value!);
  osc.start();

  nodes.push(osc);
  nodes.push(filter);
  nodes.push(amp);

  return [
    // todo: exponential scaling for frequencies
    { node: osc.frequency, minValue: 20, maxValue: 20000, name: "pitch" },
    { node: amp.gain, minValue: 0, maxValue: 1, name: "amp" },
    { node: filter.frequency, minValue: 20, maxValue: 20000, name: "filter" }
  ];
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
