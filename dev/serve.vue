<template>
  <div id="app">
    <audio controls :src="trackSrc" />

    <br />

    <CurveGraph />

    <v-a-audio-file-visualizer
      ref="audioFileViz"
    />

    <v-a-toggle-button label="mute" />

    <br />

    <ChannelStrip :input="channelInput" :output="channelOutput" />
    <MasterChannel :input="channelOutput" :output="audioCtx.destination" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import WebAudioHelpers from "./util/web-audio-helpers";
import ChannelStrip from "./channel-strip.vue";
import MasterChannel from "./master-channel.vue";
import VAAudioFileVisualizer from "../src/lib-components/v-a-audio-file-visualizer.vue";
import CurveGraph from "./curve-graph.vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    ChannelStrip,
    MasterChannel,
    CurveGraph,
  },
  setup() {
    const audioCtx = WebAudioHelpers.setupAudioContext();
    const osc = audioCtx.createOscillator();
    const leftGain = audioCtx.createGain();
    const rightGain = audioCtx.createGain();
    const channelInput = audioCtx.createGain();
    const channelOutput = audioCtx.createGain();
    const dummyGain = audioCtx.createGain();
    const analyzerWidth = 700;

    const trackSrc = computed(() => {
      // return require("./assets/lost-in-the-fog.wav");
      return require("./assets/maenads.wav");
      // return require("./assets/baccata.wav");
      // return require("./assets/dinky-break.wav");
      // return require("./assets/kick-1.wav");
    });

    const sampleSrc = computed(() => {
      // return require("./assets/dinky-break.wav");
      return require("./assets/kick-1.wav");
    });

    return {
      leftGain,
      rightGain,
      channelInput,
      channelOutput,
      audioCtx,
      osc,
      analyzerWidth,
      dummyGain,
      trackSrc,
      sampleSrc
    };
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
        (this.$refs.audioFileViz as typeof VAAudioFileVisualizer)
        .loadAudioFromAmplitudeData(buffer.getChannelData(0));
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
