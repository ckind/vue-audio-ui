# v-audio-ui

A library of rich UI components for web-based audio applications built with Vue 3 and TypeScript.

Beautiful, accessible, and audio-focused components — knobs, faders, meters, analyzers and more — designed for DAW-like and pro-audio interfaces.

---

## Key Features

- Modern Vue 3 + TypeScript codebase
- High-quality, reusable UI components for audio apps
- Optimized for low-overhead rendering and smooth interactions
- Components included: knobs, faders, analog/digital meters, spectrum analyzer, toggle buttons, file visualizer
- Lightweight and framework-friendly — drop into Vue projects or components

## Quick Install

Install from NPM (or use the local package during development):

```bash
npm install v-audio-ui
# or
yarn add v-audio-ui
```

## Basic Usage (Vue 3 + TypeScript)

Example: register and use a `v-a-fader` component in a Vue SFC.

```vue
<template>
  <div class="channel-strip">
    <v-a-knob v-model="gain" label="Gain"/>
    <v-a-fader v-model="level"/>
    <v-a-analog-meter :level="meterLevel"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { VAFader, VAKnob, VAAnalogMeter } from 'v-audio-ui'

export default defineComponent({
  components: { VAFader, VAKnob, VAAnalogMeter },
  setup() {
    const gain = ref(0)
    const level = ref(0.5)
    const meterLevel = ref(0)
    return { gain, level, meterLevel }
  }
})
</script>
```

Note: component names and exports follow the `v-a-*` naming pattern — check the library index for the exact exports.

## Available Components (high level)

- `v-a-knob` — rotary controls with configurable ranges and sensitivity
- `v-a-fader` — vertical/horizontal faders with smooth dragging
- `v-a-analog-meter`, `v-a-digital-meter` (stereo variants) — level meters
- `v-a-spectrum-analyzer` — real-time FFT visualization
- `v-a-toggle-button` — toggleable controls with clear state
- `v-a-audio-file-visualizer` — waveform rendering for audio files

## Development & Local Demo

To run the development demo and story-like examples locally (project root):

```bash
# install deps
npm install

# run dev/demo (project uses Vite/Rollup dev server in the `dev` folder)
npm run dev
# or use the custom serve script
npm run build && npm run preview
```

If you want to work on a specific demo in `dev/`, open the `dev/serve.vue` or the example SFCs and modify them.

## Building

```bash
npm run build
```

This produces the distributable bundle(s) in the configured output directory (see `build/rollup.config.js`).

## Contributing

- Fork the repo and open a PR with focused changes.
- Keep TypeScript types up-to-date when adding or changing public components.
- Include visual snapshots or short demo SFCs for UI changes.

## Where to Start in the Codebase

- Entry points: `src/entry.ts`, `src/entry.esm.ts`
- Components: `src/lib-components/` (primary UI components)
- Dev/demo: `dev/` (example pages and SFCs)
- Utilities: `src/util/`, `dev/assets/util/`

## License

MIT — see the LICENSE file in the repository.

---

Want changes? If you'd like a longer README with API tables, live demos, or storybook integration, tell me which sections to expand and I'll update the file.