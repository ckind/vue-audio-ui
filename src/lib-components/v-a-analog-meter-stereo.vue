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
import { defineComponent, PropType } from "vue";
import { AnalogMeterType } from "@/types/v-audio-ui-types";

export default defineComponent({
  name: "VAAnalogMeterStereo",
  props: {
    leftInput: {
      required: true,
      type: AudioNode,
    },
    rightInput: {
      required: true,
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
.meter-channel {
  margin: 2px;
}
.stereo-meter-container {
  display: block;
}
</style>