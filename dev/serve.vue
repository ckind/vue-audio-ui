<template>
  <div id="app">
    <audio controls :src="trackSrc" />
    
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
      :input="monoGain"
      :audioContext="audioCtx"
      :fftSize="2048"
      :drawLines="true"
      :width="analyzerWidth"
      gridColor="gray"
      lineColor="black"
      backgroundColor="white"
    /> -->

    <ChannelStrip :input="channelInput" :output="channelOutput" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />
    <ChannelStrip :input="channelInput" :output="dummyGain" />

    <v-a-digital-meter-stereo
      class="ui-component"
      type="rms"
      :leftInput="leftGain"
      :rightInput="rightGain"
      :drawMarkers="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import WebAudioHelpers from "@/util/web-audio-helpers";
import ChannelStrip from "./channel-strip.vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    ChannelStrip
  },
  setup() {
    const ctx = WebAudioHelpers.setupAudioContext();
    const osc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    const channelInput = ctx.createGain();
    const channelOutput = ctx.createGain();

    const dummyGain = ctx.createGain();

    channelOutput.connect(ctx.destination);

    const state = reactive({
      leftGain: leftGain,
      rightGain: rightGain,
      channelInput: channelInput,
      channelOutput: channelOutput,
      audioCtx: ctx,
      osc: osc,
      analyzerWidth: 700,
      dummyGain: dummyGain
    });

    return state;
  },
  computed: {
    trackSrc() {
      return require("./lost-in-the-fog.wav");
      // return require("./maenads.wav");
      // return require("./baccata.wav");
    },
  },
  mounted(): void {
    // const f = 200;

    // this.osc.frequency.setValueAtTime(f, this.audioCtx.currentTime );
    // this.osc.connect(this.audioCtx.destination);
    // this.osc.start();

    // this.osc.connect(this.monoGain);
    // this.osc.connect(this.leftGain);
    // this.osc.connect(this.rightGain);

    // window.setTimeout(() => this.osc.frequency.setValueAtTime(f + 20, this.audioCtx.currentTime), 2000);

    // window.setTimeout(() => this.osc.stop(), 2000);

    // this.requestMicrophoneAccess();

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
  methods: {
    requestMicrophoneAccess() {
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          const source = this.audioCtx.createMediaStreamSource(stream);
          source.connect(this.channelInput);
        })
        .catch((err) => {
          console.log("error requesting microphone access:" + err);
        });
    },
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
