<template>
  <div>
    <button @click="disconnectMatrix(sources, destinations)">Disconnect Matrix</button>
    <div
      class="matrix-row"
      v-for="(row, srcIndex) in matrix"
      :key="`src-${srcIndex}`"
    >
      <div
        class="matrix-cell"
        v-for="(node, destIndex) in row"
        :key="`dest-${destIndex}`"
      >
        
        <!-- Placeholder for gain nodes between source and destination -->
        <div class="gain-node-placeholder">
          <!-- {{ `S${srcIndex} → D${destIndex}` }} -->
          <input type="number" v-model="matrix[srcIndex][destIndex].gain.value"></input>
          <!-- {{ matrix[srcIndex][destIndex] }} -->
          <!-- <v-a-num-box :minValue="0" :maxValue="1" v-model="sources[srcIndex][destIndex].gain.value" /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref} from "vue";
import { setupAudioContext } from "../helpers/web-audio-helpers.ts";

const props = defineProps({
  sources: {
    type: Array as () => Array<AudioNode>,
    required: true
  },
  destinations: {
    type: Array as () => Array<AudioParam>,
    required: true
  }
});

const matrix = ref<Array<Array<GainNode>>>([]);

watch(() => props.sources, (newSources, oldSources) => {
  console.log(' Sources changed:', newSources, 're-connecting matrix');
  disconnectMatrix(oldSources, props.destinations);
  connectMatrix(newSources, props.destinations);
});

watch(() => props.destinations, (newDestinations, oldDestinations) => {
  console.log(' Destinations changed:', newDestinations, 're-connecting matrix');
  disconnectMatrix(props.sources, oldDestinations);
  connectMatrix(props.sources, newDestinations);
});

function disconnectMatrix(sources: Array<AudioNode>, destinations: Array<AudioParam>) {
  sources.forEach(source => {
    const row = matrix.value.shift();
    row?.forEach(gainNode => {
      source.disconnect(gainNode);
      gainNode.disconnect();
    });
  });
  matrix.value = [];
}

function connectMatrix(sources: Array<AudioNode>, destinations: Array<AudioParam>) {
  // connect sources to destinations
  const ctx = setupAudioContext();

  sources.forEach((source) => {
    const row: Array<GainNode> = [];
    destinations.forEach((destination) => {
      const gainNode = new GainNode(ctx, { gain: 0 });
      source.connect(gainNode);
      gainNode.connect(destination);
      row.push(gainNode);
    });
    matrix.value.push(row);
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