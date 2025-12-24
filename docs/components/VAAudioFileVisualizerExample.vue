<template>
  <div>
    <div class="example">
      <div class="visualizer-container">
        <v-a-audio-file-visualizer
          ref="visualizerRef"
          :width="512"
          :height="height"
        />
      </div>

      <!-- <div class="props">
        <div>
          <label for="width">width: </label>
          <input
            id="width"
            v-model.number="width"
            type="number"
            min="100"
            max="1200"
          />
        </div>

        <div>
          <label for="height">height: </label>
          <span id="height">{{ height }}</span>
        </div>

        <div>
          <label for="lineColor">lineColor: </label>
          <input id="lineColor" v-model="lineColor" type="color" />
        </div>

        <div>
          <label for="backgroundColor">backgroundColor: </label>
          <input id="backgroundColor" v-model="backgroundColor" type="color" />
        </div>

        <button @click="loadSampleData">Load Sample Data</button>
      </div>
       -->
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

const loadSampleDataSine = () => {
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

  console.log(visualizerRef.value);

  visualizerRef.value?.loadAudioFromAmplitudeData(channelData);
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