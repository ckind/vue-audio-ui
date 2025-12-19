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