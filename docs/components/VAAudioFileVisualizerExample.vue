<template>
  <div>
    <div class="example">
      <div class="visualizer-container">
        <v-a-audio-file-visualizer
          ref="visualizerRef"
          :width="512"
          :height="height"
          @audioSelection="onAudioSelection"
        />
      </div>

      {{ audioSelectedDisplay }}
    </div>

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VAAudioFileVisualizer } from "vue-audio-ui";

import PropsTable from "./PropsTable.vue";
import { setupAudioContext } from "../helpers/web-audio-helpers";

const width = ref(600);
const height = ref(-1); // computed based on width
const visualizerRef = ref<InstanceType<typeof VAAudioFileVisualizer> | null>(null);
const propsToDisplay = ref(VAAudioFileVisualizer.props);
const audioSelectedDisplay = ref("");

function loadSampleDataSine() {
  // Generate sample amplitude data (sine wave)
  const sampleRate = 44100;
  const duration = 2; // seconds
  const numSamples = sampleRate * duration;
  const amplitudeData = new Float32Array(numSamples);
  const sineHz = 440;

  for (let i = 0; i < numSamples; i++) {
    amplitudeData[i] = Math.sin((2 * Math.PI * sineHz * i) / sampleRate) * 0.5; // 440Hz sine wave
  }

  visualizerRef.value?.loadAudioFromAmplitudeData(amplitudeData);
};

async function loadSampleDataFile() {
  const ctx = setupAudioContext();

  const response = await fetch('/audio/brink.mp3');
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);

  visualizerRef.value?.loadAudioFromAmplitudeData(channelData);
}

function onAudioSelection(data: any) {
  audioSelectedDisplay.value =
    `audio selected - startIndex: ${data.startIndex}, endIndex: ${data.endIndex}`
}

onMounted(() => {
  loadSampleDataSine();
  // loadSampleDataFile();
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