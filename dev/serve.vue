<template>
  <div id="app">
    <audio controls :src="trackSrc" />

    <v-a-audio-file-visualizer
      ref="audioFileViz"
      :zoom="zoom"
      :selectionStart="selectionStart"
      :selectionEnd="selectionEnd"
    />
    <v-a-knob v-model="selectionStart" :minValue="0" :maxValue="1" />
    <v-a-knob v-model="selectionEnd" :minValue="0" :maxValue="1" />
    <v-a-fader v-model="zoom" :minValue="0" :maxValue="1" />

    <!-- <v-a-analog-meter-stereo
      :width="200"
      class="ui-component"
      type="rms"
      :leftInput="leftGain"
      :rightInput="rightGain"
    /> -->

    <br />

    <!-- <v-a-knob v-model="analyzerWidth" :minValue="200" :maxValue="1200" /> -->

    <!-- <v-a-spectrum-analyzer
      :input="channelOutput"
      :width="analyzerWidth"
      gridColor="gray"
      lineColor="white"
      backgroundColor="black"
      borderColor="black"
    /> -->

    <ChannelStrip :input="channelInput" :output="channelOutput" />
    <!-- <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" /> -->
    <MasterChannel :input="channelOutput" :output="audioCtx.destination" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import WebAudioHelpers from "./util/web-audio-helpers";
import ChannelStrip from "./channel-strip.vue";
import MasterChannel from "./master-channel.vue";
import VAAudioFileVisualizer from "../src/lib-components/v-a-audio-file-visualizer.vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    ChannelStrip,
    MasterChannel,
  },
  setup() {
    const ctx = WebAudioHelpers.setupAudioContext();
    const osc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    const channelInput = ctx.createGain();
    const channelOutput = ctx.createGain();
    const zoom = 1;
    const selectionStart = 0;
    const selectionEnd = 1;

    const dummyGain = ctx.createGain();

    const state = reactive({
      leftGain: leftGain,
      rightGain: rightGain,
      channelInput: channelInput,
      channelOutput: channelOutput,
      audioCtx: ctx,
      osc: osc,
      analyzerWidth: 700,
      dummyGain: dummyGain,
      zoom: zoom,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
    });

    return state;
  },
  computed: {
    trackSrc() {
      // return require("./lost-in-the-fog.wav");
      // return require("./maenads.wav");
      // return require("./baccata.wav");
      // return require("./dinky-break.wav");
      return require("./kick-1.wav");
    },
    sampleSrc() {
      // return require("./dinky-break.wav");
      // return require("./lost-in-the-fog.wav");
      return require("./kick-1.wav");
    },
  },
  mounted(): void {
    // const f = 200;
    // this.osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
    // this.osc.start();

    // WebAudioHelpers.requestMicrophoneAccess(this.audioCtx, (source: MediaStreamAudioSourceNode) => {
    //   source.connect(this.channelInput);
    // });

    fetch(this.trackSrc)
      .then((response) => response.arrayBuffer())
      .then((buffer) => this.audioCtx.decodeAudioData(buffer))
      .then((buffer) => {
        // todo: sum channels to mono?
        (
          this.$refs.audioFileViz as typeof VAAudioFileVisualizer
        ).loadAudioFromAmplitudeData(buffer.getChannelData(0));
      });

    // get the audio element
    const audioElement = document.querySelector("audio")!;

    // pass it into the audio context
    const track = this.audioCtx.createMediaElementSource(audioElement);
    const splitter = this.audioCtx.createChannelSplitter(2);

    track.connect(this.channelInput);
    this.channelOutput.connect(splitter);
    splitter.connect(this.leftGain, 0);
    splitter.connect(this.rightGain, 1);
  },
});
</script>


<style scoped>
.ui-component {
  margin: 2px;
}
.stereo-meter-container {
  display: inline-block;
}
</style>
