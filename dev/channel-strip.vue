<template>
  <div class="channel-strip-container" ref="container">

    <div class="eq-container">
      <div class="eq-band-container">
        high
        <v-a-knob class="eq-knob" v-model="highEqGain" :size="50" :minValue="-10" :maxValue="10" />
      </div>
      <div class="eq-band-container">
        mid
        <v-a-knob class="eq-knob" v-model="midEqGain" :size="50" :minValue="-20" :maxValue="20" />
      </div>
      <div class="eq-band-container">
        low
        <v-a-knob class="eq-knob" v-model="lowEqGain" :size="50" :minValue="-20" :maxValue="20" />
      </div>
    </div>

    <br />

    <div class="volume-container">
      <v-a-fader
        v-model="faderGain"
        :minValue="0"
        :maxValue="1"
      />
      <v-a-digital-meter
        class="ui-component"
        type="peak"
        :input="postGain"
        :drawMarkers="true"
      />
    </div>

    <!-- <v-a-toggle-button :label="'mute'" :color="'red'" />
    <v-a-toggle-button :label="'solo'" :color="'blue'" /> -->

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  Name: "ChannelStrip",
  setup(props) {
    const highEqGain = 0;
    const midEqGain = 0;
    const lowEqGain = 0;
    const faderGain = 1;

    const lowshelf = new BiquadFilterNode(props.input.context, { type: "lowshelf", gain: lowEqGain });
    const midpeaking = new BiquadFilterNode(props.input.context, { type: "peaking", gain: midEqGain });
    const highshelf = new BiquadFilterNode(props.input.context, { type: "highshelf", gain: highEqGain });
    const postGain = new GainNode(props.input.context, { gain: faderGain });

    props.input.connect(lowshelf);
    lowshelf.connect(midpeaking);
    midpeaking.connect(highshelf);
    highshelf.connect(postGain);
    postGain.connect(props.output);

    return reactive({
      lowshelf: lowshelf,
      midpeaking: midpeaking,
      highshelf: highshelf,
      highEqGain: highEqGain,
      midEqGain: midEqGain,
      lowEqGain: lowEqGain,
      postGain: postGain,
      faderGain: faderGain
    })
  },
  props: {
    input: {
      required: true,
      type: AudioNode,
    },
    output: {
      required: true,
      type: AudioNode,
    },
  },
  computed: {
    backgroundImg() {
      return require("@/assets/metal-2.png");
    }
  },
  mounted() {
    (this.$refs.container as HTMLElement).style.backgroundImage = `url(${this.backgroundImg})`;
  },
  watch: {
    // todo: rampTo? sounds clicking when making sudden changes
    highEqGain(value: number) {
      this.highshelf.gain.setValueAtTime(value, this.input.context.currentTime);
    },
    midEqGain(value: number) {
      this.midpeaking.gain.setValueAtTime(value, this.input.context.currentTime);
    },
    lowEqGain(value: number) {
      this.lowshelf.gain.setValueAtTime(value, this.input.context.currentTime);
    },
    faderGain(value: number) {
      this.postGain.gain.setValueAtTime(value, this.input.context.currentTime);
    },
  }
});
</script>

<style scoped>
.channel-strip-container {
  color: gray;
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