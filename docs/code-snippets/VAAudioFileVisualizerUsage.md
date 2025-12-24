**Usage**

```vue
<template>
  <v-a-audio-file-visualizer :amplitudeData="amplitudeData" />
</template>

<script setup>
import { ref, onMounted } from "vue";

const amplitudeData = ref<Float32Array<ArrayBuffer>>();

// Load audio data (example with Web Audio API)
const loadAudioFile = async (file: File) => {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get amplitude data from the first channel
  amplitudeData.value = audioBuffer.getChannelData(0);
};
</script>
```