<template>
  <div>
    <div class="example">

      <audio controls ref="my-audio">
        <source src="../public/audio/waterbug.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div class="meter">
        peak
        <v-a-digital-meter-stereo class="ui-component" type="peak" :leftInput="leftInput" :rightInput="rightInput"
          :drawMarkers="true" />
      </div>

      <div class="meter">
        rms
        <v-a-digital-meter-stereo class="ui-component" type="rms" :leftInput="leftInput" :rightInput="rightInput"
          :drawMarkers="true" />
      </div>

      <div class="props">

      </div>
    </div>

    <p><strong>Props</strong></p>
    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { VADigitalMeterStereo } from "@pkg/v-audio-ui";
import PropsTable from "./PropsTable.vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VADigitalMeterStereo.props);
const leftInput = ref<AudioNode>();
const rightInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(() => {
  ctx = setupAudioContext();

  // get the audio element
  const audioElement = myAudio.value as HTMLAudioElement;

  // pass it into the audio context
  const track = ctx.createMediaElementSource(audioElement);

  // setup left and right inputs
  leftInput.value = new GainNode(ctx, { gain: 1 });
  rightInput.value = new GainNode(ctx, { gain: 1 });
  const splitter = new ChannelSplitterNode(ctx);

  splitter.connect(leftInput.value, 0);
  splitter.connect(rightInput.value, 1);

  track.connect(splitter);
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
