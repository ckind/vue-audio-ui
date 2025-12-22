<template>
  <div>
    <div
      class="matrix-row"
      v-for="(row, srcIndex) in matrix"
      :key="`src-${srcIndex}`"
    >
    <!-- todo: label sources and destinations -->
    <!-- {{ row[srcIndex].source.name }} -->
      <div
        class="matrix-cell"
        v-for="(cell, destIndex) in row"
        :key="`dest-${destIndex}`"
      >
        <v-a-num-box
          :minValue="0"
          :maxValue="1"
          @update:modelValue="cellModAmountUpdate(cell.modAmountNode, $event)"
          v-model="cell.modAmountValue"
          :fixedDecimals="2"
          :width="60"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref} from "vue";

type DestinationNode = AudioParam | AudioNode;

type ModMatrixCell = { 
  modAmountValue: number; // dummy value for v-model binding
  modAmountNode: GainNode;
  modMaxNode: GainNode;
  minOffsetNode: ConstantSourceNode;
  source: ModMatrixSource;
  destination: ModMatrixDestination
}

export type ModMatrixSource = {
  node: AudioNode;
  name: string;
};
export type ModMatrixDestination = {
  node: DestinationNode;
  name: string;
  minValue: number;
  maxValue: number;
};

const props = defineProps({
  sources: {
    type: Array as () => Array<ModMatrixSource>,
    required: true
  },
  destinations: {
    type: Array as () => Array<ModMatrixDestination>,
    required: true
  }
});

const audioContext = ref<BaseAudioContext>();

const matrix = ref<Array<Array<ModMatrixCell>>>([]);

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

function cellModAmountUpdate(gainNode: GainNode, gainValue: number) {
  gainNode.gain.setValueAtTime(gainValue, audioContext.value!.currentTime);
}

function disconnectMatrix(sources: Array<ModMatrixSource>, destinations: Array<ModMatrixDestination>) {
  sources.forEach(source => {
    const row = matrix.value.shift();
    row?.forEach(cell => {
      source.node.disconnect(cell.modMaxNode);
      cell.minOffsetNode.stop();
      cell.minOffsetNode.disconnect();
      cell.modMaxNode.disconnect();
      cell.modAmountNode.disconnect();
    });
  });
  matrix.value = [];
}

function connectMatrix(sources: Array<ModMatrixSource>, destinations: Array<ModMatrixDestination>) {
  // connect sources to destinations
  if (sources.length > 0) {
    audioContext.value = sources[0]?.node.context;
  }

  if (!audioContext.value) {
    return;
  }

  sources.forEach((source) => {
    const row: Array<ModMatrixCell> = [];
    destinations.forEach((destination) => {
      const valueRange = destination.maxValue - destination.minValue;
      const modulationRange = valueRange / 2;
      const minOffsetNode = new ConstantSourceNode(audioContext.value!, { offset: destination.minValue + modulationRange });
      const modMaxNode = new GainNode(audioContext.value!, { gain: modulationRange });
      const modAmountNode = new GainNode(audioContext.value!, { gain: destination.minValue});

      minOffsetNode.start();

      if (destination.node instanceof AudioParam) {
        source.node.connect(modMaxNode).connect(modAmountNode);
        minOffsetNode.connect(modAmountNode);
        modAmountNode.connect(destination.node);
      }
      else if (destination.node instanceof AudioNode) {
        source.node.connect(modMaxNode).connect(modAmountNode);
        minOffsetNode.connect(modAmountNode);
        modAmountNode.connect(destination.node);
      }

      row.push({
        modAmountValue: destination.minValue,
        modMaxNode,
        minOffsetNode,
        modAmountNode,
        source,
        destination
      });
    });
    matrix.value.push(row);
  });
}

</script>

<style scoped>
.matrix-row {
  display: flex;
}
</style>