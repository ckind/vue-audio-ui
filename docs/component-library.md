<script setup>
import { ref } from 'vue';
import VAFaderExample from './components/VAFaderExample.vue';
import VAKnobExample from './components/VAKnobExample.vue';
// import VADigitalMeterExample from './components/VADigitalMeterExample.vue';
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
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```

## v-a-knob

Hardware-style knob with customizable assets. Click and drag to adjust value. Double-click to return to default value. Set the step prop to snap to the nearest value within the given increment (0 for max resolution).

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
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```

<!-- ## v-a-digital-meter

Simple db meter with peak and rms modes. Set the input prop to an <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode">AudioNode</a>.

<VADigitalMeterExample />

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
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
``` -->