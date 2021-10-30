<template>
  <div class="stereo-meter-container">
    <v-a-digital-meter
      class="meter-channel"
      :input="leftInput"
      :fftSize="fftSize"
      :type="type"
      :height="height"
      :width="width"
      :drawMarkers="false"
    />
    <v-a-digital-meter
      class="meter-channel"
      :input="rightInput"
      :fftSize="fftSize"
      :type="type"
      :height="height"
      :width="width"
      :drawMarkers="drawMarkers"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MeterType } from "@/types/v-audio-ui-types";

export default defineComponent({
  name: "VADigitalMeterStereo",
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
      type: String as PropType<MeterType>,
      default: "peak",
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048,
    },
    drawMarkers: {
      required: false,
      type: Boolean,
      default: false,
    },
    height: {
      required: false,
      type: Number,
      default: 200,
    },
    width: {
      required: false,
      type: Number,
      default: 20,
    },
  },
});
</script>

<style scoped>
.meter-channel {
  margin: 2px;
}
.stereo-meter-container {
  display: inline-block;
}
</style>