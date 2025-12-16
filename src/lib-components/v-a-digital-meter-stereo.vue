<template>
  <div class="stereo-meter-container">
    <v-a-digital-meter
      class="meter-channel"
      :input="leftInput"
      :fftSize="fftSize"
      :type="type"
      :height="height"
      :width="width"
      :barColor="barColor"
      :backgroundColor="backgroundColor"
      :markerColor="markerColor"
      :font="font"
      :clippingColor="clippingColor"
      :drawMarkers="false"
    />
    <v-a-digital-meter
      class="meter-channel"
      :input="rightInput"
      :fftSize="fftSize"
      :type="type"
      :height="height"
      :width="width"
      :barColor="barColor"
      :backgroundColor="backgroundColor"
      :markerColor="markerColor"
      :font="font"
      :clippingColor="clippingColor"
      :drawMarkers="drawMarkers"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DigitalMeterType } from "@/types/v-audio-ui-types";

export default defineComponent({
  name: "VADigitalMeterStereo",
  props: {
    leftInput: {
      required: true,
      type: Object,
    },
    rightInput: {
      required: true,
      type: Object,
    },
    type: {
      required: false,
      type: String as PropType<DigitalMeterType>,
      default: "peak",
    },
    fftSize: {
      required: false,
      type: Number,
      default: 2048,
    },
    clippingColor: {
      required: false,
      type: String,
      default: "#e64a19",
    },
    barColor: {
      required: false,
      type: String,
      default: "#4caf50",
    },
    backgroundColor: {
      required: false,
      type: String,
      default: "#e0e0e0",
    },
    markerColor: {
      required: false,
      type: String,
      default: "gray",
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
    font: {
      required: false,
      type: String,
      default: "Helvetica, sans-serif",
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