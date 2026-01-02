**Usage**

```vue
<template>
  <v-a-fader v-model="modelValue" :minValue="0" :maxValue="100" />
  <!-- with custom assets -->
  <v-a-fader v-model="modelValue" :minValue="0" :maxValue="100">
    <template #faderBackground>
      <img src="./path-to/my-fader-background.svg" />
    </template>
    <template #faderHead>
      <img src="./path-to/my-fader-head.png" />
    </template>
  </v-a-fader>
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```
