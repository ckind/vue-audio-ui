**Usage**

```vue
<template>
  <audio controls ref="my-audio">
    <source src="a-banger.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
  <v-a-analog-meter type="rms" :input="meterInput" />

</template>

<script setup>
import { ref, useTemplateRef, onMounted } from "vue";

const meterInput = ref<AudioNode>();
const myAudio = useTemplateRef("my-audio");
let ctx: AudioContext;

onMounted(() => {
  ctx = new window.AudioContext();
  document.addEventListener("mousedown", () => {
    if (ctx.state != "running") {
      ctx.resume();
    }
  });

  // get the audio element
  const audioElement = myAudio.value as HTMLAudioElement;

  // pass it into the audio context
  const track = ctx.createMediaElementSource(audioElement);
  meterInput.value = ctx.createGain();
  track.connect(meterInput.value);
  track.connect(ctx.destination);
});

</script>
```