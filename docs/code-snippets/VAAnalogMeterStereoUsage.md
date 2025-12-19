**Usage**

```vue
<template>
  <audio controls ref="my-audio">
    <source src="a-banger.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
  <v-a-analog-meter-stereo type="rms" :leftInput="leftInput" :rightInput="rightInput" />

</template>

<script setup>
import { ref, useTemplateRef, onMounted } from "vue";

const leftInput = ref<AudioNode>();
const rightInput = ref<AudioNode>();
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
```