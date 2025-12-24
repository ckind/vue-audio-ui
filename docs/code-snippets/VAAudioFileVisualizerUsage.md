**Usage**

```vue
<template>
  <v-a-audio-file-visualizer
    ref="visualizerRef"
    :width="800"
    :height="-1"
    lineColor="white"
    backgroundColor="black"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";

const visualizerRef = ref(null);

// Load audio data (example with Web Audio API)
const loadAudioFile = async (file: File) => {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get amplitude data from the first channel
  const amplitudeData = audioBuffer.getChannelData(0);

  visualizerRef.value?.loadAudioFromAmplitudeData(amplitudeData);
};
</script>
```