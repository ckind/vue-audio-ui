<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  name: "Test",
  setup() {
    const test1 = ref<HTMLElement | null>(null);

    onMounted(() => console.log(test1.value));

    return {
      test1
    }
  },
});
</script>

<template>
  <div ref="test1">Hello World</div>
</template>