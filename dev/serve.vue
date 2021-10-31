<template>
  <div id="app">
    <audio controls :src="trackSrc" />

    Peak
    <v-a-digital-meter-stereo
      class="ui-component"
      type="peak"
      :leftInput="leftGain"
      :rightInput="rightGain"
      :drawMarkers="true"
    />
    RMS
    <v-a-digital-meter-stereo
      class="ui-component"
      type="rms"
      :leftInput="leftGain"
      :rightInput="rightGain"
      :drawMarkers="true"
    />
    RMS (Mono)
    <v-a-fader v-model="gainValue" :minValue="0" :maxValue="1" :showShadow="true" />
    <v-a-digital-meter
      class="ui-component"
      type="rms"
      :input="monoGain"
      :drawMarkers="true"
    />

    <br />

    <v-a-knob v-model="analyzerWidth" :minValue="200" :maxValue="1200" />

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

    <v-a-analog-meter-stereo
      :width="200"
      class="ui-component"
      type="rms"
      :leftInput="leftGain"
      :rightInput="rightGain"
    />

    <ChannelStrip :input="monoGain" />
    <ChannelStrip :input="monoGain" />
    <ChannelStrip :input="monoGain" />
    <ChannelStrip :input="monoGain" />
    <ChannelStrip :input="monoGain" />
    <ChannelStrip :input="monoGain" />
    <v-a-fader v-model="gainValue" :minValue="0" :maxValue="1" :showShadow="true" />
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
    const monoGain = ctx.createGain();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    const gainValue = 0.5;
    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(gainValue, ctx.currentTime);

    const state = reactive({
      leftGain: leftGain,
      rightGain: rightGain,
      monoGain: monoGain,
      audioCtx: ctx,
      osc: osc,
      gainValue: gainValue,
      trackGain: trackGain,
      analyzerWidth: 700
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
  watch: {
    gainValue(value: number) {
      this.trackGain.gain.setValueAtTime(value, this.audioCtx.currentTime);
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

    track.connect(this.trackGain);

    this.trackGain.connect(this.monoGain);
    this.trackGain.connect(splitter);
    splitter.connect(this.leftGain, 0);
    splitter.connect(this.rightGain, 1);

    this.trackGain.connect(this.audioCtx.destination);
  },
  methods: {
    requestMicrophoneAccess() {
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          const source = this.audioCtx.createMediaStreamSource(stream);
          source.connect(this.monoGain);
          source.connect(this.leftGain);
          source.connect(this.rightGain);
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
