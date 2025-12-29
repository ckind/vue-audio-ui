<template>
  <div>
    <div class="example">
      <div class="visualizer-container">
        <v-a-audio-file-visualizer
          :amplitudeData="amplitudeData"
          @audioSelection="onAudioSelection"
        />
      </div>
    </div>

    {{ audioSelectedDisplay }}

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VAAudioFileVisualizer } from "vue-audio-ui";

import PropsTable from "./PropsTable.vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";

const amplitudeData = ref<Float32Array<ArrayBuffer>>();
const propsToDisplay = ref(VAAudioFileVisualizer.props);
const audioSelectedDisplay = ref("");

function loadSampleDataSine() {
  // Generate sample amplitude data (sine wave)
  const sampleRate = 44100;
  const duration = 2; // seconds
  const numSamples = sampleRate * duration;
  const data = new Float32Array(numSamples);
  const sineHz = 440;

  for (let i = 0; i < numSamples; i++) {
    data[i] = Math.sin((2 * Math.PI * sineHz * i) / sampleRate) * 0.5; // 440Hz sine wave
  }

  amplitudeData.value = data;
}

async function loadSampleDataFile() {
  const ctx = await requestGlobalAudioContext();

  const response = await fetch("/audio/brink.mp3");
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  amplitudeData.value = audioBuffer.getChannelData(0);
}

function onAudioSelection(data: any) {
  audioSelectedDisplay.value = `@audioSelection - ${JSON.stringify(data)}`;
}

onMounted(() => {
  // loadSampleDataSine();
  loadSampleDataFile();
});
</script>

<style scoped>
.example {
  display: flex;
  align-items: flex-start;
  gap: 2em;
}

.visualizer-container {
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
