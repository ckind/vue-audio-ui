<template>
  <div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { type DigitalMeterType } from "@/types/vue-audio-ui-types";

export default defineComponent({
  name: "VADigitalMeterStereo",
  props: {
    leftInput: {
      required: false,
      type: Object, // type: AudioNode -- need to use Object for SSR
    },
    rightInput: {
      required: false,
      type: Object, // type: AudioNode -- need to use Object for SSR
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
      type: String
    },
    backgroundColor: {
      required: false,
      type: String
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