<template>
  <div>
    <p>
      Note: audio won't play until you've clicked anywhere on this page (outside
      of player). See
      <a
        target="blank"
        href="https://stackoverflow.com/questions/44613124/click-event-doesnt-fire-on-an-audio-element-in-chrome"
        >here</a
      >
      and
      <a
        target="blank"
        href="https://qa.fmod.com/t/html5-javascript-audiocontext-requires-user-interaction/16009"
        >here</a
      >
      for details.
    </p>

    <div class="example">
      <audio controls ref="my-audio" class="audio-player">
        <source src="/audio/brink.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div class="meters">
        <div>
          <span class="meter-label">peak</span>
          <v-a-digital-meter
            type="peak"
            :input="meterInput"
            :drawMarkers="true"
          />
        </div>

        <div>
          <span class="meter-label">rms</span>
          <v-a-digital-meter
            type="rms"
            :input="meterInput"
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
import { VADigitalMeter } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";
import { requestGlobalAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VADigitalMeter.props);
const meterInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(async () => {
  ctx = await requestGlobalAudioContext();

  // get the audio element
  const audioElement = myAudio.value as HTMLAudioElement;

  // pass it into the audio context
  const track = ctx.createMediaElementSource(audioElement);
  meterInput.value = ctx.createGain();
  track.connect(meterInput.value);
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
