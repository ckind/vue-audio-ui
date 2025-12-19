**Usage**

```vue
<template>
	todo:
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from "vue";

const analyzerInput = ref<AudioNode>();
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
  analyzerInput.value = ctx.createGain();
  track.connect(analyzerInput.value);
  track.connect(ctx.destination);
});

</script>
```