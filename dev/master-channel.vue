<template>
  <div class="channel-strip-container" ref="container">
    <div class="volume-container">
      <v-a-spectrum-analyzer
        :input="faderGainNode"
        :width="500"
        gridColor="gray"
        lineColor="white"
        backgroundColor="black"
        borderColor="black"
      />

      <br />

      <v-a-fader v-model="faderGainValue" :minValue="0" :maxValue="1" />
      <v-a-digital-meter-stereo
        class="ui-component"
        type="rms"
        :leftInput="leftChannel"
        :rightInput="rightChannel"
        :drawMarkers="true"
      />

      <v-a-analog-meter :input="faderGainNode" :width="300" />
    </div>
  </div>
</template>

<script lang="ts">
import vAAnalogMeter from "@/lib-components/v-a-analog-meter.vue";
import { defineComponent, reactive } from "vue";

export default defineComponent({
  components: { vAAnalogMeter },
  Name: "ChannelStrip",
  setup(props) {
    const faderGainValue = 1;
    const faderGainNode = new GainNode(props.input.context, {
      gain: faderGainValue,
    });
    props.input.connect(faderGainNode);
    faderGainNode.connect(props.output);

    const splitter = new ChannelSplitterNode(props.input.context);
    faderGainNode.connect(splitter);

    const leftChannel = new GainNode(props.input.context, { gain: 1 });
    const rightChannel = new GainNode(props.input.context, { gain: 1 });

    splitter.connect(leftChannel, 0);
    splitter.connect(rightChannel, 1);

    return reactive({
      faderGainNode: faderGainNode,
      faderGainValue: faderGainValue,
      leftChannel: leftChannel,
      rightChannel: rightChannel,
    });
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
    },
  },
  mounted() {
    (
      this.$refs.container as HTMLElement
    ).style.backgroundImage = `url(${this.backgroundImg})`;
  },
  watch: {
    // todo: rampTo? sounds clicking when making sudden changes
    faderGainValue(value: number) {
      this.faderGainNode.gain.setValueAtTime(
        value,
        this.input.context.currentTime
      );
    },
  },
});
</script>

<style scoped>
.channel-strip-container {
  color: gray;
  display: inline-block;
  border: solid 1px gray;
  padding: 10px 5px;
  height: 400px;
}
.eq-band-container {
  display: flex;
  margin: 5px;
  justify-content: space-around;
}
</style>