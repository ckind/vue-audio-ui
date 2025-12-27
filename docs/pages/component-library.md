<script setup>
import { ref } from 'vue';
import VAFaderExample from '../components/VAFaderExample.vue';
import VAKnobExample from '../components/VAKnobExample.vue';
import VADigitalMeterExample from '../components/VADigitalMeterExample.vue';
import VADigitalMeterStereoExample from '../components/VADigitalMeterStereoExample.vue';
import VAAnalogMeterExample from '../components/VAAnalogMeterExample.vue';
import VASpectrumAnalyzerExample from '../components/VASpectrumAnalyzerExample.vue';
import VAOscilloscopeExample from '../components/VAOscilloscopeExample.vue';
import VAEnvelopeADSRExample from '../components/VAEnvelopeADSRExample.vue';
import VANumBoxExample from '../components/VANumBoxExample.vue'
import VAModMatrixExample from '../components/VAModMatrixExample.vue';
import VAPianoExample from '../components/VAPianoExample.vue';
import VAAudioFileVisualizerExample from '../components/VAAudioFileVisualizerExample.vue';
</script>

# Available Components

This page documents and demonstrates the available components in vue-audio-ui.

## v-a-num-box

DAW-style number box. Click and drag to adjust. Double-click to type in values.

<VANumBoxExample />

<!--@include: ../code-snippets/VANumBoxUsage.md -->

## v-a-fader

Hardware-style fader with customizable assets. Click and drag to adjust value. Double-click to return to default value. Use the faderHead and fackBackground slots for custom assets (svg and img tags currently supported). Slot content will automatically be resized to fit the <strong>height</strong> and <strong>width</strong> props. Consider setting <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio" target="blank">preserveAspectRatio</a> to "none" for svg assets.

<VAFaderExample />

<!--@include: ../code-snippets/VAFaderUsage.md -->

## v-a-knob

Hardware-style knob with customizable assets. Click and drag to adjust value. Double-click to return to default value. Set the step prop to snap to the nearest value within the given increment (0 for max resolution). Use the default slot for custom assets (svg and img tags supported). The asset should be in the 12 o'clock position and will be resized according to the <strong>size</strong> prop.

<VAKnobExample />

<!--@include: ../code-snippets/VAKnobUsage.md -->

## v-a-digital-meter

Simple db meter with peak and rms modes. Set the input prop to an <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode">AudioNode</a>.

<VADigitalMeterExample />

<!--@include: ../code-snippets/VADigitalMeterUsage.md -->

Also see discussion on <a href="/web-audio-api-and-ssr">server-side rendering</a>.

## v-a-digital-meter-stereo

Stereo version of <a href="#v-a-digital-meter">v-a-digital-meter</a>.

<VADigitalMeterStereoExample />

<!--@include: ../code-snippets/VADigitalMeterStereoUsage.md -->

## v-a-analog-meter

VU-style meter. Set the input prop to an <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode">AudioNode</a>.

<VAAnalogMeterExample />

<!--@include: ../code-snippets/VAAnalogMeterUsage.md -->

## v-a-oscilloscope

An oscilloscope for visualizing time-domain data. The <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize">fftSize</a> prop must be a power of 2 between 2^5 and 2^15. The resulting length of the buffer drawn each frame will be half of the fftSize.

<VAOscilloscopeExample />

<!--@include: ../code-snippets/VAOscilloscopeUsage.md -->

## v-a-spectrum-analyzer

A spectrum analyzer for visualizing frequency-domain data. The <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize">fftSize</a> prop must be a power of 2 between 2^5 and 2^15. A larger fftSize will result in higher resolution across the spectrum but a higher latency in the graph.
<VASpectrumAnalyzerExample />

<!--@include: ../code-snippets/VASpectrumAnalyzerUsage.md -->

## v-a-audio-file-visualizer

An interactive audio file visualizer for displaying amplitude data. Click and drag to select. Ctrl+click (or command+click on mac) and drag to zoom.

- `audioSelection`: Emitted when user makes a selection. Returns the selection start and end indexes in the floating point sample array. Note that start can be before end.

<VAAudioFileVisualizerExample />

<!--@include: ../code-snippets/VAAudioFileVisualizerUsage.md -->

## v-a-envelope-adsr

An adjustable Attack-Decay-Sustain-Release envolope. The modelValue is an AdsrSettings instance. Note that a new object will be emitted on update:modelValue. Emits the 

```js
interface AdsrSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
```

<VAEnvelopeADSRExample />

<!--@include: ../code-snippets/VAEnvelopeADSRUsage.md -->

## v-a-mod-matrix

Modification matrix for creating complex patches. Takes in an array sources and destinations patching them all together with a modulation amount adjustable via <a href="#v-a-num-box">v-a-num-box</a>.

<VAModMatrixExample />

<!--@include: ../code-snippets/VAModMatrixUsage.md -->

## v-a-piano

A virtual piano keyboard for triggering musical notes. Click or touch keys to emit events.

<VAPianoExample />

<!--@include: ../code-snippets/VAPianoUsage.md -->