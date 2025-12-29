# vue-audio-ui

[![npm version](https://badge.fury.io/js/vue-audio-ui.svg)](https://badge.fury.io/js/vue/vue-audio-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A library of rich UI components for web-based audio applications built with Vue 3 and TypeScript.

View the documenation with interactive examples [here](https://purple-ocean-0ca0d4410.1.azurestaticapps.net/).

Sleek, accessible, and audio-focused components — knobs, faders, meters, analyzers and more — designed for DAW-like and pro-audio interfaces.

## Features

- **Vue 3 & TypeScript**: Built with modern Vue 3 Composition API and full TypeScript support
- **Audio-Focused**: Components designed specifically for audio applications and DAWs
- **Accessible**: Built with accessibility in mind for inclusive user experiences
- **Customizable**: Highly customizable styling and behavior
- **Lightweight**: Minimal dependencies, optimized for performance
- **SSR Compatible**: Designed to work with server-side rendering frameworks

## Installation

```bash
npm install vue-audio-ui
```

## Usage

Import and install the plugin in your Vue application:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import VAudioUI from 'vue-audio-ui'
import 'vue-audio-ui/style.css'

const app = createApp(App)
app.use(VAudioUI)
app.mount('#app')
```

Or import components individually:

```javascript
import { VAFader, VAKnob } from 'vue-audio-ui'
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
import { VAFader, VAKnob } from 'vue-audio-ui'

const volume = ref(50)
const gain = ref(1)
</script>
```

## Documentation

For detailed documentation, examples, and API reference, visit the [docs](./docs/) folder.

## Development

### Building the Library

```bash
cd pkg
npm install
npm run build
```

### Running Docs and Demo App

To run the docs:

```bash
cd pkg
npm run publish-local #publishes the package to a local directory for testing
cd docs
npm link-package #link docs to local publish
npm install
npm run docs:dev
```

To run the app:

```bash
cd app
npm run publish-local #publishes the package to a local directory for testing
cd docs
npm link-package #link docs to local publish
npm install
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT