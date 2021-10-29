<template>
  <div id="app">
    <audio controls :src="trackSrc" />

    <v-a-simple-meter class="ui-component" :input="leftGain" />
    <v-a-simple-meter class="ui-component" :input="rightGain" />

    <v-a-classic-meter class="ui-component" type="rms" :input="monoGain" />

    <v-a-simple-meter class="ui-component" type="rms" :input="leftGain" />
    <v-a-simple-meter class="ui-component" type="rms" :input="rightGain" />

    <div class="ui-component" style="height: 200px; width: 600px; display: inline-block">
      <v-a-spectrum-analyzer :input="monoGain" :audioContext="audioCtx" :fftSize="8192" />
    </div>
    
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import WebAudioHelpers from '@/util/web-audio-helpers';

export default defineComponent({
  name: 'ServeDev',
  setup() {
    const ctx = WebAudioHelpers.setupAudioContext();
    const osc = ctx.createOscillator();
    const monoGain = ctx.createGain();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    const state = reactive({
      leftGain: leftGain,
      rightGain: rightGain,
      monoGain: monoGain,
      audioCtx: ctx,
      osc: osc
    });

    return state;
  },
  computed: {
    trackSrc() {
      // return require("./lost-in-the-fog.wav");
      // return require("./maenads.wav");
      return require("./baccata.wav");
    }
  },
  mounted(): void {
    // this.osc.frequency.setValueAtTime(440, this.audioCtx.currentTime );
    // this.osc.connect(this.audioCtx.destination);
    // this.osc.start();

    // this.osc.connect(this.monoGain);
    // this.osc.connect(this.leftGain);
    // this.osc.connect(this.rightGain);

    // window.setTimeout(() => this.osc.stop(), 2000);

    // this.requestMicrophoneAccess();

    

    
    // get the audio element
    const audioElement = document.querySelector('audio')!;

    // pass it into the audio context
    const track = this.audioCtx.createMediaElementSource(audioElement);
    const splitter = this.audioCtx.createChannelSplitter(2);

    track.connect(this.monoGain);
    track.connect(splitter);
    splitter.connect(this.leftGain, 0);
    splitter.connect(this.rightGain, 1);

    track.connect(this.audioCtx.destination);
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
  }
});
</script>


<style scoped>
.ui-component {
  margin: 2px;
}
</style>
