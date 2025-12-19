import { type App, type Plugin } from 'vue';
import vueAudioUITheme from './src/theme.ts';
import test from './src/lib/test.vue'

import VAAnalogMeter from './src/lib/v-a-analog-meter.vue'
import VAAudioFileVisualizer from './src/lib/v-a-audio-file-visualizer.vue'
import VADigitalMeterStereo from './src/lib/v-a-digital-meter-stereo.vue'
import VADigitalMeter from './src/lib/v-a-digital-meter.vue'
import VAFader from './src/lib/v-a-fader.vue'
import VAKnob from './src/lib/v-a-knob.vue'
import VASpectrumAnalyzer from './src/lib/v-a-spectrum-analyzer.vue'
import VAOscilloscope from './src/lib/v-a-oscilloscope.vue'
import VAToggleButton from './src/lib/v-a-toggle-button.vue'

const components = {
  // test,
  VAAnalogMeter,
  VAAudioFileVisualizer,
  VADigitalMeterStereo,
  VADigitalMeter,
  VAFader,
  VAKnob,
  VASpectrumAnalyzer,
  VAOscilloscope,
  VAToggleButton,
};

// install function executed by Vue.use()
const install: Exclude<Plugin['install'], undefined> = function installVAudioUi(app: App) {
  Object.entries(components).forEach(([componentName, component]) => {
    app.component(componentName, component);
  });
};

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export {
  // test,
  VAAnalogMeter,
  VAAudioFileVisualizer,
  VADigitalMeterStereo,
  VADigitalMeter,
  VAFader,
  VAKnob,
  VASpectrumAnalyzer,
  VAOscilloscope,
  VAToggleButton,

  vueAudioUITheme
};
