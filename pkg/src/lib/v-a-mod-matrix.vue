<template>
  <div>
    <!-- Header row for destination names -->
    <div class="matrix-row header">
      <div class="matrix-cell source-label"></div>
      <div
        class="matrix-cell destination-label"
        v-for="(dest, destIndex) in destinations"
        :key="`header-${destIndex}`"
      >
        {{ dest.name }}
      </div>
    </div>
    <!-- Matrix rows -->
    <div
      class="matrix-row"
      v-for="(row, srcIndex) in matrix"
      :key="`src-${srcIndex}`"
    >
      <!-- Source label -->
      <div class="matrix-cell source-label">
        {{ row[0]?.source.name }}
      </div>
      <!-- Matrix cells -->
      <div
        class="matrix-cell"
        v-for="(cell, destIndex) in row"
        :key="`dest-${destIndex}`"
      >
        <v-a-num-box
          :minValue="0"
          :maxValue="1"
          @update:modelValue="cellModAmountUpdate(cell, $event)"
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
  // todo: clicks or pops when reconnecting?
  // console.log(' Sources changed:', newSources, 're-connecting matrix');
  disconnectMatrix(oldSources, props.destinations);
  connectMatrix(newSources, props.destinations);
});

watch(() => props.destinations, (newDestinations, oldDestinations) => {
  // todo: clicks or pops when reconnecting?
  // console.log(' Destinations changed:', newDestinations, 're-connecting matrix');
  disconnectMatrix(props.sources, oldDestinations);
  connectMatrix(props.sources, newDestinations);
});

function cellModAmountUpdate(cell: ModMatrixCell, value: number) {
  cell.modAmountNode.gain.setValueAtTime(value, audioContext.value!.currentTime);
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
    const defaultModAmount = 0;
    destinations.forEach((destination) => {
      const valueRange = destination.maxValue - destination.minValue;
      const modulationRange = valueRange / 2;
      const minOffsetNode = new ConstantSourceNode(audioContext.value!, { offset: destination.minValue + modulationRange });
      const modMaxNode = new GainNode(audioContext.value!, { gain: modulationRange });
      const modAmountNode = new GainNode(audioContext.value!, { gain: defaultModAmount });

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
        modAmountValue: defaultModAmount,
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

.matrix-cell {
  padding: 4px;
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.source-label {
  width: 80px;
  text-align: right;
  padding-right: 8px;
  /* font-weight: bold; */
}

.destination-label {
  text-align: center;
  /* font-weight: bold; */
}
</style>