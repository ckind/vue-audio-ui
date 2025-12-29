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
import { onMounted, watch, ref } from "vue";
import { SignalScaler, type SignalScalerType } from "@/util/SignalScaler";
import { SignalToRatio, type SignalToRatioType } from "@/util/SignalToRatio";

type DestinationNode = AudioParam | AudioNode;

type ModMatrixCell = {
  modAmountValue: number; // dummy value for v-model binding
  modAmountNode: GainNode;
  signalToRatioConverter: SignalToRatioType;
  source: ModMatrixSource;
  destination: ModMatrixDestination;
};

type ModulationBus = {
  destination: ModMatrixDestination;
  sourceCells: Array<ModMatrixCell>;
  ratioSum?: AudioNode;
  clamper?: AudioNode;
  outputScaler?: SignalScaler;
  output?: AudioNode;
};

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
    required: true,
  },
  destinations: {
    type: Array as () => Array<ModMatrixDestination>,
    required: true,
  },
  loggerNode: {
    type: Object, // type: AudioNode -- need to use Object for SSR
    required: false,
  },
});

// todo: don't really need a ref for audioContext
// could just use a regular let
const audioContext = ref<BaseAudioContext>();
const matrix = ref<Array<Array<ModMatrixCell>>>([]);
let modulationBuses: Array<ModulationBus> = [];

watch(
  () => props.sources,
  (newSources, oldSources) => {
    // todo: clicks or pops when reconnecting?
    // console.log(' Sources changed:', newSources, 're-connecting matrix');
    disconnectMatrix(oldSources, props.destinations);
    connectMatrix(newSources, props.destinations);
  }
);

watch(
  () => props.destinations,
  (newDestinations, oldDestinations) => {
    // todo: clicks or pops when reconnecting?
    // console.log(' Destinations changed:', newDestinations, 're-connecting matrix');
    disconnectMatrix(props.sources, oldDestinations);
    connectMatrix(props.sources, newDestinations);
  }
);

function cellModAmountUpdate(cell: ModMatrixCell, value: number) {
  cell.modAmountNode.gain.setValueAtTime(
    value,
    audioContext.value!.currentTime
  );
}

function connectModulationBus(ctx: BaseAudioContext, bus: ModulationBus) {
  // 1. sum all of the ratios together
  // 2. clamp the ratio sum to [0, 1] - with waveshaper node?
  // 3. scale the ratios to the output min and max

  bus.ratioSum = new GainNode(ctx, { gain: 1 });
  bus.sourceCells.forEach((cell) => {
    if (bus.ratioSum) cell.modAmountNode.connect(bus.ratioSum);
  });

  // use waveshaper to clamp ratioSum to [0, 1]
  bus.clamper = new WaveShaperNode(ctx, { curve: [0, 0, 1] });
  bus.ratioSum.connect(bus.clamper);
  // scale clamper output to [dest.min, dest.max]
  // todo: could use more efficient signal scaler if input is known to be [0,1]
  bus.outputScaler = new SignalScaler(
    ctx,
    0,
    1,
    bus.destination.minValue,
    bus.destination.maxValue
  );
  bus.clamper.connect(bus.outputScaler.input);
  bus.output = bus.outputScaler.output;

  if (bus.destination.node instanceof AudioParam) {
    bus.output.connect(bus.destination.node);
  } else if (bus.destination.node instanceof AudioNode) {
    bus.output.connect(bus.destination.node);
  }
}

function disconnectModulationBus(bus: ModulationBus) {
  bus.sourceCells.forEach((cell) => {
    cell.modAmountNode.disconnect();
  });
  bus.ratioSum?.disconnect();
  bus.ratioSum = undefined;
  bus.clamper?.disconnect();
  bus.clamper = undefined;
}

function connectMatrix(
  sources: Array<ModMatrixSource>,
  destinations: Array<ModMatrixDestination>
) {
  // todo: just build the matrix out of modulation buses instead of dual-maintaining data structures

  // connect sources to destinations
  if (sources.length > 0) {
    audioContext.value = sources[0]?.node.context;
  }

  if (!audioContext.value) {
    return;
  }

  const ctx = audioContext.value;
  const cells: ModMatrixCell[] = [];

  sources.forEach((source) => {
    const row: Array<ModMatrixCell> = [];
    const defaultModAmount = 0;

    destinations.forEach((destination) => {
      const modAmountNode = new GainNode(ctx, { gain: defaultModAmount });
      const signalToRatioConverter = new SignalToRatio(
        ctx,
        source.minValue,
        source.maxValue
      );
      source.node.connect(signalToRatioConverter.input);
      signalToRatioConverter.output.connect(modAmountNode);
      const cell = {
        modAmountValue: defaultModAmount,
        modAmountNode,
        signalToRatioConverter,
        source,
        destination,
      };
      row.push(cell);
      cells.push(cell);
    });
    matrix.value.push(row);
  });

  destinations.forEach((dest) => {
    const bus: ModulationBus = {
      destination: dest,
      sourceCells: cells.filter((cell) => cell.destination === dest),
    };
    connectModulationBus(ctx, bus);
    modulationBuses.push(bus);
  });
}

function disconnectMatrix(
  sources: Array<ModMatrixSource>,
  destinations: Array<ModMatrixDestination>
) {
  sources.forEach((source) => {
    const row = matrix.value.shift();
    row?.forEach((cell) => {
      cell.source.node.disconnect(cell.signalToRatioConverter.input);
      cell.signalToRatioConverter.dispose();
      cell.modAmountNode.disconnect();
    });
  });

  matrix.value = [];

  modulationBuses.forEach((bus) => {
    disconnectModulationBus(bus);
  });

  modulationBuses = [];
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
