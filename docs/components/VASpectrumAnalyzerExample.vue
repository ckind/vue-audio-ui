<template>
  <div>
    <audio controls ref="my-audio">
      <source src="/audio/brink.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>

    <br />

    <v-a-spectrum-analyzer
      :input="analyzerInput"
      :width="500"
      :fftSize="4096"
      fillStyle="none"
    />

    <br />

    <v-a-spectrum-analyzer
      :input="analyzerInput"
      :width="500"
      :fftSize="4096"
      fillStyle="solid"
    />

    <p><strong>Props</strong></p>
    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { VASpectrumAnalyzer } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VASpectrumAnalyzer.props);
const analyzerInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(async () => {
  ctx = await requestGlobalAudioContext();

  // get the audio element
  const audioElement = myAudio.value as HTMLAudioElement;

  // pass it into the audio context
  const track = ctx.createMediaElementSource(audioElement);
  analyzerInput.value = ctx.createGain();
  track.connect(analyzerInput.value);
  track.connect(ctx.destination);
});
</script>

<style scoped>
.meter {
  flex: 0 0 auto;
}
</style>
