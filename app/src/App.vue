<template>
  <div id="app">
    <AudioContextSetup />

    <audio controls :src="trackSrc" />

    <br />

    <div class="console">
      <ChannelStrip :input="channelInput" :output="channelOutput" />
      <ChannelStrip :input="channelInput" :output="dummyGain" />
      <ChannelStrip :input="channelInput" :output="dummyGain" />
      <ChannelStrip :input="channelInput" :output="dummyGain" />
      <MasterChannel :input="channelOutput" :output="audioCtx.destination" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import WebAudioHelpers from "./util/web-audio-helpers.ts";
import ChannelStrip from "@/components/channel-strip.vue";
import MasterChannel from "@/components/master-channel.vue";
import AudioContextSetup from "@/components/audio-context-setup.vue";
import TrackSrc from "@/assets/synth-breaks.mp3";

export default defineComponent({
  name: "ServeDev",
  components: {
    ChannelStrip,
    MasterChannel,
    AudioContextSetup
  },
  setup() {
    const ctx = WebAudioHelpers.setupAudioContext();
    const osc = ctx.createOscillator();
    const channelInput = ctx.createGain();
    const channelOutput = ctx.createGain();
    const dummyGain = ctx.createGain();

    const state = reactive({
      channelInput: channelInput,
      channelOutput: channelOutput,
      audioCtx: ctx,
      osc: osc,
      dummyGain: dummyGain,
    });

    return state;
  },
  computed: {
    trackSrc() {
      return TrackSrc;
    },
  },
  mounted(): void {
    // const f = 200;
    // this.osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
    // this.osc.start();

    // WebAudioHelpers.requestMicrophoneAccess(this.audioCtx, (source: MediaStreamAudioSourceNode) => {
    //   source.connect(this.channelInput);
    // });

    // get the audio element
    const audioElement = document.querySelector("audio")!;

    // pass it into the audio context
    const track = this.audioCtx.createMediaElementSource(audioElement);
    track.connect(this.channelInput);
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
.console {
  display: flex;
}
</style>