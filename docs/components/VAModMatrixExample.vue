<template>
  <div>
    <p>Here is a simple filtered sawtooth patch with 3 different LFO's for modulation.</p>
    <button class="mute-btn" @click="toggleMute">{{ isMuted ? "Unmute" : "Mute" }}</button>
    <br />
    <v-a-mod-matrix :sources="sources" :destinations="destinations" :loggerNode="logger" />

    <!-- <v-a-oscilloscope :input="lfo1ScopeInput" :fftSize="32768" /> -->
    <!-- <v-a-oscilloscope :input="lfo2ScopeInput" :fftSize="32768" /> -->
    <!-- <v-a-oscilloscope :input="lfo3ScopeInput" :fftSize="32768" /> -->
    <!-- <v-a-oscilloscope :input="mainOutput" :fftSize="32768" /> -->
    <!-- <v-a-spectrum-analyzer :input="mainOutput" :fftSize="32768" /> -->
    <!-- <v-a-digital-meter :input="mainOutput" drawMarkers /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";
import { createPowCurveNode, createDbToGainNode, createScaleNode, createLoggerNode } from "../helpers/audio-worklet-factory.ts"
import { type ModMatrixSource, type ModMatrixDestination } from "vue-audio-ui";

const sources = ref<Array<ModMatrixSource>>([]);
const destinations = ref<Array<ModMatrixDestination>>([]);
const nodes: Array<AudioNode> = [];
const mainOutput = ref<GainNode>();
const isMuted = ref(true);

const lfo1ScopeInput = ref<AudioNode>();
const lfo2ScopeInput = ref<AudioNode>();
const lfo3ScopeInput = ref<AudioNode>();

const logger = ref<AudioNode>();

onMounted(async () => {
  await setupMatrix();
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

async function setupMatrix() {
  const ctx = await requestGlobalAudioContext();

  mainOutput.value = new GainNode(ctx, { gain: isMuted.value ? 0 : 1 });

  lfo1ScopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo2ScopeInput.value = new GainNode(ctx, { gain: 1 });
  lfo3ScopeInput.value = new GainNode(ctx, { gain: 1 });

  // logger.value = createLoggerNode(ctx);

  sources.value = [
    setupLFO(ctx, 2, "triangle", "LFO 1", lfo1ScopeInput.value),
    setupLFO(ctx, 10, "sine", "LFO 2", lfo2ScopeInput.value),
    setupLFO(ctx, 0.1, "sine", "LFO 3", lfo3ScopeInput.value),
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

function setupLFO(ctx: AudioContext, frequency: number, type: OscillatorType, name: string, scopeInput?: AudioNode, ): ModMatrixSource {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.start();

  nodes.push(osc);

  if (scopeInput) {
    osc.connect(scopeInput);
  }
  return { node: osc, minValue: -1, maxValue: 1, name };
}

function setupFilteredOscillator(ctx: AudioContext, frequency: number): Array<ModMatrixDestination> {
  const osc = ctx.createOscillator();
  const pitchNode = createPowCurveNode(ctx, 20, 20000, 2);
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 20 });
  const filterCutoffNode = createPowCurveNode(ctx, 20, 20000, 2);
  const amp = new GainNode(ctx, { gain: 0 });
  const volumeNode = createDbToGainNode(ctx, -60);

  osc.type = "sawtooth";
  osc.frequency.value = frequency;
  osc.connect(filter).connect(amp).connect(mainOutput.value!);
  osc.start();

  filterCutoffNode.connect(filter.frequency);
  pitchNode.connect(osc.frequency);
  volumeNode.connect(amp.gain);

  nodes.push(osc);
  nodes.push(pitchNode);
  nodes.push(filter);
  nodes.push(filterCutoffNode);
  nodes.push(amp);
  nodes.push(volumeNode);

  return [
    { node: volumeNode, minValue: -60, maxValue: 0, name: "amp" },
    { node: pitchNode, minValue: 20, maxValue: 20000, name: "pitch" },
    { node: filterCutoffNode, minValue: 20, maxValue: 20000, name: "filter" }
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
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-text-1);
}
</style>
