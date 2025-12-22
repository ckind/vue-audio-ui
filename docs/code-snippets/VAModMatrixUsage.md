**Usage**

```vue
<template>
    <v-a-mod-matrix :sources="sources" :destinations="destinations" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { type ModMatrixSource, type ModMatrixDestination } from "vue-audio-ui";

const sources = ref<Array<ModMatrixSource>>([]);
const destinations = ref<Array<ModMatrixDestination>>([]);

onMounted(() => {
  setupMatrix();
});

onUnmounted(() => {
  disconnectMatrix();
});
</script>
```

See <a href="https://github.com/ckind/vue-audio-ui/blob/main/docs/components/VAModMatrixExample.vue" target="blank">here</a> for full example.