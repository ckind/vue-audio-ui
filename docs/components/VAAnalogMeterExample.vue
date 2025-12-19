<template>
  <div>
    <audio controls ref="my-audio">
      <source src="/audio/brink.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
    <div class="example">
      <div class="meter">
        peak
        <v-a-analog-meter class="ui-component" type="peak" :input="meterInput" />
      </div>
      <div class="meter">
        rms
        <v-a-analog-meter class="ui-component" type="rms" :input="meterInput" />
      </div>
    </div>

    <p><strong>Props</strong></p>
    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";
import { VAAnalogMeter } from "@pkg/v-audio-ui";
import PropsTable from "./PropsTable.vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

const propsToDisplay = ref(VAAnalogMeter.props);
const meterInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(() => {
  ctx = setupAudioContext();

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
