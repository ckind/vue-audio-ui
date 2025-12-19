<script setup>
import { ref } from 'vue';
import VAFaderExample from './components/VAFaderExample.vue';
import VAKnobExample from './components/VAKnobExample.vue';
import VADigitalMeterExample from './components/VADigitalMeterExample.vue';
import VADigitalMeterStereoExample from './components/VADigitalMeterStereoExample.vue';
</script>

# Available Components

This page documents and demonstrates the available components in v-audio-ui.

## v-a-fader

Hardware-style fader with customizable assets. Click and drag to adjust value. Double-click to return to default value. Use the faderHead and fackBackground slots for custom assets (svg and img tags currently supported). Slot content will automatically be resized to fit the <strong>height</strong> and <strong>width</strong> props. Consider setting <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio" target="blank">preserveAspectRatio</a> to "none" for svg assets.

<VAFaderExample />

**Usage**

```vue
<template>
  <v-a-fader
      v-model="modelValue"
      :minValue="0"
      :maxValue="100"
  />
  <!-- with custom assets -->
  <v-a-fader v-model="modelValue" :minValue="0" :maxValue="100">
    <template #faderBackground>
      <img src="./path-to/my-fader-background.svg">
    </template>
    <template #faderHead>
      <img src="./path-to/my-fader-head.png">
    </template>
  </v-a-fader>
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```

## v-a-knob

Hardware-style knob with customizable assets. Click and drag to adjust value. Double-click to return to default value. Set the step prop to snap to the nearest value within the given increment (0 for max resolution). Use the default slot for custom assets (svg and img tags supported). The asset should be in the 12 o'clock position and will be resized according to the <strong>size</strong> prop.

<VAKnobExample />

**Usage**

```vue
<template>
  <v-a-knob
    class="eq-knob"
    v-model="modelValue"
    :size="60"
    :minValue="0"
    :maxValue="10"
    :default="5"
    :step="1"
  />
  <!-- with custom asset -->
  <v-a-knob
    class="eq-knob"
    v-model="modelValue"
    :size="60"
    :minValue="0"
    :maxValue="10"
    :default="5"
    :step="1"
  >
    <img src="./path-to/custom-knob.svg">
  </v-a-knob>
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```

## v-a-digital-meter

Simple db meter with peak and rms modes. Set the input prop to an <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode">AudioNode</a>.

<VADigitalMeterExample />

**Usage**

```vue
<template>
  <audio controls ref="my-audio">
    <source src="a-banger.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
  <v-a-digital-meter class="ui-component" type="rms" :input="meterInput" :drawMarkers="true" />

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

## v-a-digital-meter-stereo

Stereo version of <a href="/component-library#v-a-digital-meter">v-a-digital-meter</a>.

<VADigitalMeterStereoExample />

**Usage**

```vue
<template>
  <audio controls ref="my-audio">
    <source src="a-banger.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
  </audio>
  <v-a-digital-meter class="ui-component" type="rms" :input="meterInput" :drawMarkers="true" />

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

Also see discussion on <a href="/web-audio-api-and-ssr">server-side rendering</a>.