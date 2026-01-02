<template>
  <div>
    <div class="example">
      <audio controls ref="my-audio" class="audio-player">
        <source src="/audio/waterbug.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div class="meters">
        <div>
          <span class="meter-label">peak</span>
          <v-a-digital-meter-stereo
            class="ui-component"
            type="peak"
            :leftInput="leftInput"
            :rightInput="rightInput"
            :drawMarkers="true"
          />
        </div>

        <div>
          <span class="meter-label">rms</span>
          <v-a-digital-meter-stereo
            class="ui-component"
            type="rms"
            :leftInput="leftInput"
            :rightInput="rightInput"
            :drawMarkers="true"
          />
        </div>
      </div>

      <div class="example-props"></div>
    </div>

    <p><strong>Props</strong></p>
    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { VADigitalMeterStereo } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VADigitalMeterStereo.props);
const leftInput = ref<AudioNode>();
const rightInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(async () => {
  ctx = await requestGlobalAudioContext();

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
.meters {
  display: flex;
  justify-content: center;
  gap: 2em;
}
.meter-label {
  display: block;
  margin-bottom: 0.5em;
}
.audio-player {
  flex: 0 0 auto;
  min-width: 200px;
}
</style>
