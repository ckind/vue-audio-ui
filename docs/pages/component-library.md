<script setup>
import { ref } from 'vue';
import VAFaderExample from '../components/VAFaderExample.vue';
import VAKnobExample from '../components/VAKnobExample.vue';
import VADigitalMeterExample from '../components/VADigitalMeterExample.vue';
import VADigitalMeterStereoExample from '../components/VADigitalMeterStereoExample.vue';
import VAAnalogMeterExample from '../components/VAAnalogMeterExample.vue';
import VAAnalogMeterStereoExample from '../components/VAAnalogMeterStereoExample.vue';
import VASpectrumAnalyzerExample from '../components/VASpectrumAnalyzerExample.vue';
import VAOscilloscopeExample from '../components/VAOscilloscopeExample.vue';
</script>

# Available Components

This page documents and demonstrates the available components in vue-audio-ui.

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

## v-a-analog-meter-stereo

Stereo version of <a href="#v-a-analog-meter">v-a-analog-meter</a>.

<VAAnalogMeterStereoExample />

<!--@include: ../code-snippets/VAAnalogMeterStereoUsage.md -->

## v-a-oscilloscope

An oscilloscope for visualizing time-domain data. The <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize">fftSize</a> prop must be a power of 2 between 2^5 and 2^15. The resulting length of the buffer drawn each frame will be half of the fftSize.

<VAOscilloscopeExample />

<!--@include: ../code-snippets/VAOscilloscopeUsage.md -->

## v-a-spectrum-analyzer

A spectrum analyzer for visualizing frequency-domain data. The <a target="blank" href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize">fftSize</a> prop must be a power of 2 between 2^5 and 2^15. A larger fftSize will result in higher resolution across the spectrum but a less responsive graph. 
<VASpectrumAnalyzerExample />

<!--@include: ../code-snippets/VASpectrumAnalyzerUsage.md -->

