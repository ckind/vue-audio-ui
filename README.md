# v-audio-ui

[![npm version](https://badge.fury.io/js/v-audio-ui.svg)](https://badge.fury.io/js/v-audio-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A library of rich UI components for web-based audio applications built with Vue 3 and TypeScript.

Sleak, accessible, and audio-focused components — knobs, faders, meters, analyzers and more — designed for DAW-like and pro-audio interfaces.

## Features

- **Vue 3 & TypeScript**: Built with modern Vue 3 Composition API and full TypeScript support
- **Audio-Focused**: Components designed specifically for audio applications and DAWs
- **Accessible**: Built with accessibility in mind for inclusive user experiences
- **Customizable**: Highly customizable styling and behavior
- **Lightweight**: Minimal dependencies, optimized for performance

## Components

- `v-a-fader` - Hardware-style fader control
- `v-a-knob` - Rotary knob control with customizable assets
- `v-a-analog-meter` - Analog-style level meter
- `v-a-analog-meter-stereo` - Stereo analog level meter
- `v-a-digital-meter` - Digital dB meter
- `v-a-digital-meter-stereo` - Stereo digital dB meter
- `v-a-spectrum-analyzer` - Real-time spectrum analyzer
- `v-a-audio-file-visualizer` - Audio file waveform visualizer
- `v-a-toggle-button` - Toggle button for on/off states

## Installation

```bash
npm install v-audio-ui
```

## Usage

Import and install the plugin in your Vue application:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import VAudioUI from 'v-audio-ui'

const app = createApp(App)
app.use(VAudioUI)
app.mount('#app')
```

Or import components individually:

```javascript
import { VAFader, VAKnob } from 'v-audio-ui'
```

### Example

```vue
<template>
  <div class="audio-controls">
    <v-a-fader v-model="volume" :minValue="0" :maxValue="100" />
    <v-a-knob v-model="gain" :minValue="0" :maxValue="10" :step="0.1" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VAFader, VAKnob } from 'v-audio-ui'

const volume = ref(50)
const gain = ref(1)
</script>
```

## Documentation

For detailed documentation, examples, and API reference, visit the [docs](./docs/) folder.

## Development

### Demo App

To run the demo application:

```bash
cd app
npm install
npm run dev
```

### Building the Library

```bash
cd pkg
npm install
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT