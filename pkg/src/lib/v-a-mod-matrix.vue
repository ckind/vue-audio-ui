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
import { SignalScaler, type SignalScalerType } from "@/util/SignalScaler";

type DestinationNode = AudioParam | AudioNode;

type ModMatrixCell = { 
  modAmountValue: number; // dummy value for v-model binding
  modAmountNode: GainNode;
  scaler: SignalScalerType;
  source: ModMatrixSource;
  destination: ModMatrixDestination
}

type ModulationBus  = {
  destination: ModMatrixDestination,
  node: AudioNode
}

export type ModMatrixSource = {
  node: AudioNode;
  name: string;
  minValue: number;
  maxValue: number;
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
  },
  loggerNode: {
    type: AudioNode,
    required: false
  }
});

// todo: don't really need a ref for audioContext
// could just use a regular let
const audioContext = ref<BaseAudioContext>();
const matrix = ref<Array<Array<ModMatrixCell>>>([]);
const modulationBuses: ModulationBus[] = [];

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
      source.node.disconnect(cell.scaler.input);
      cell.modAmountNode.disconnect();
      cell.scaler.dispose();
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

  const ctx = audioContext.value;

  sources.forEach((source) => {
    const row: Array<ModMatrixCell> = [];
    const defaultModAmount = 0;

    // todo: should bus all the modulations to one node then connect that to the destination
    // that way the bus can be clamped with dest min/max and offsets can be controlled
    // potential optimization - sources with the same min and max could share a scaler node
    destinations.forEach((destination) => {
      // scale signal on source range to destination range
      const scaler = new SignalScaler(ctx, source.minValue, source.maxValue, destination.minValue, destination.maxValue);      
      const modAmountNode = new GainNode(ctx, { gain: defaultModAmount });

      // todo: still issue with negative numbers
      // multiplying by mod amount moves the value towards 0,
      // which is an issue for decibels (where 0 is max value)
      if (destination.node instanceof AudioParam) {
        source.node.connect(scaler.input);
        scaler.output.connect(modAmountNode).connect(destination.node);
      }
      else if (destination.node instanceof AudioNode) {
        source.node.connect(scaler.input);
        scaler.output.connect(modAmountNode).connect(destination.node);
      }

      row.push({
        modAmountValue: defaultModAmount,
        modAmountNode,
        scaler,
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