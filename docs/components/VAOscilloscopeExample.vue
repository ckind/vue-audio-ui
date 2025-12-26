<template>
  <div>
    <audio controls ref="my-audio">
      <source src="/audio/waterbug.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>

    <br />

    <div class="example">
      <v-a-oscilloscope :input="analyzerInput" :fftSize="8192" />
    </div>

    <p><strong>Props</strong></p>
    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { VAOscilloscope } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VAOscilloscope.props);
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
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.meter {
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
