# Getting Started

## Installation

Install the v-audio-ui package via npm.

```
npm install v-audio-ui
```

Import and install the plugin on your root Vue application.

```js{4}
import { createApp } from 'vue'
import App from './App.vue'
import VAudioUI from "v-audio-ui"

const app = createApp(App);

app.use(VAudioUI);
app.mount('#app');
```

Or import components and register manually.

```js{4}
import { VAFader } from "v-audio-ui";

// etc...
```

## Usage

**Fader Example**

```vue
<template>
<div class="fader">
    <v-a-fader
        v-model="modelValue"
        minValue="0"
        maxValue="100"
    />
</div>
</template>

<script setup>
import { ref } from "vue";

const modelValue = ref(0);
</script>
```

See <a href="/component-library">Components</a> for a full list of available components.