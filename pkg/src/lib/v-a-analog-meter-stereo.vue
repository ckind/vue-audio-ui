<template>
  <div class="stereo-meter-container">
    <v-a-analog-meter
      class="meter-channel"
      :input="leftInput"
      :fftSize="fftSize"
      :type="type"
      :width="width"
    />
    <v-a-analog-meter
      class="meter-channel"
      :input="rightInput"
      :fftSize="fftSize"
      :type="type"
      :width="width"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { type AnalogMeterType } from "@/types/vue-audio-ui-types";

export default defineComponent({
  name: "VAAnalogMeterStereo",
  props: {
    leftInput: {
      required: false,
      type: AudioNode,
    },
    rightInput: {
      required: false,
      type: AudioNode,
    },
    type: {
      required: false,
      type: String as PropType<AnalogMeterType>,
      default: "peak",
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048,
    },
    width: {
      required: false,
      type: Number,
      default: 300,
    },
  },
});
</script>

<style scoped>
.stereo-meter-container {
  display: flex;
  flex-direction: row; /* default, but explicit */
  align-items: flex-end; /* or center, depending on look */
  gap: 4px; /* space between meters */
}

.meter-channel {
  margin: 0; /* optional, since gap handles spacing */
}
</style>