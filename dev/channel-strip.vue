<template>
  <div class="channel-strip-container">

    <div class="eq-container">
      <div class="eq-band-container">
        high
        <v-a-knob class="eq-knob" v-model="highEqGain" :size="50" :minValue="-24" :maxValue="24" />
      </div>
      <div class="eq-band-container">
        mid
        <v-a-knob class="eq-knob" v-model="midEqGain" :size="50" :minValue="-24" :maxValue="24" />
      </div>
      <div class="eq-band-container">
        low
        <v-a-knob class="eq-knob" v-model="lowEqGain" :size="50" :minValue="-24" :maxValue="24" />
      </div>
    </div>

    <br />

    <div class="volume-container">
      <v-a-fader
        v-model="channelGain"
        :minValue="0"
        :maxValue="1"
        :showShadow="true"
      />
      <v-a-digital-meter
        class="ui-component"
        type="peak"
        :input="input"
        :drawMarkers="true"
      />
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  Name: "ChannelStrip",
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
  },
  data() {
    return {
      highEqGain: 0,
      midEqGain: 0,
      lowEqGain: 0,
      channelGain: 1
    }
  }
});
</script>

<style scoped>
.channel-strip-container {
  display: inline-block;
  border: solid 1px gray;
  padding: 10px 5px;
}
.eq-band-container {
  display: flex;
  margin: 5px;
  justify-content: space-around;
}
</style>