**Usage**

```vue
<template>
  <v-a-envelope-adsr v-model="envelope" :width="300" />
</template>

<script setup>
import { ref } from "vue";

const envelope = ref({
  attack: 10,
  decay: 200,
  sustain: 0.6,
  release: 200,
});
</script>
```
