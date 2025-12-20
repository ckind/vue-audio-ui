<template>
  <div
    class="matrix-row"
    v-for="(source, srcIndex) in sources"
    :key="`src-${srcIndex}`"
  >
    <div
      class="matrix-cell"
      v-for="(destination, destIndex) in destinations"
      :key="`dest-${destIndex}`"
    >
      <!-- Placeholder for gain nodes between source and destination -->
      <div class="gain-node-placeholder">
        {{ sources[srcIndex][destIndex] }}
        <!-- <v-a-num-box :minValue="0" :maxValue="1" v-model="sources[srcIndex][destIndex].gain.value" /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

const props = defineProps({
  sources: {
    type: Array as () => Array<AudioNode>,
    required: true
  },
  destinations: {
    type: Array as () => Array<AudioNode>,
    required: true
  }
});

watch(() => props.sources, (newSources) => {
  connectMatrix(newSources, props.destinations);
});

watch(() => props.destinations, (newDestinations) => {
  connectMatrix(props.sources, newDestinations);
});

function connectMatrix(sources: Array<AudioNode>, destinations: Array<AudioNode>) {
  // connect sources to destinations
  const ctx = setupAudioContext();
  const matrix: Array<Array<AudioNode>> = [];

  sources.forEach((source) => {
    const row: Array<AudioNode> = [];
    destinations.forEach((destination) => {
      const gainNode = ctx.createGain(0);
      source.connect(gainNode);
      gainNode.connect(destination);
      row.push(gainNode);
    });
    matrix.push(row);
  });
}

</script>

<style scoped>
.matrix-row {
  display: flex;
}
.matrix-cell {
  border: 1px solid #ccc;
  padding: 1em;
  flex: 1;
  text-align: center;
}
</style>