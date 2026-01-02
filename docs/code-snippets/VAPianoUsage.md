**Usage**

```vue
<template>
  <v-a-piano
    @keyMouseDown="handleKeyDown"
    @keyMouseUp="handleKeyUp"
    :disabled="false"
  />
</template>

<script setup>
import { ref } from "vue";

function handleKeyDown(keyNumber) {
  console.log("Key pressed:", keyNumber);
  // Trigger note on
}

function handleKeyUp(keyNumber) {
  console.log("Key released:", keyNumber);
  // Trigger note off
}
</script>
```

**Props**

- `disabled`: Disables the piano keyboard (default: false)

**Events**

- `keyMouseDown`: Emitted when a key is pressed down (provides keyNumber)
- `keyMouseUp`: Emitted when a key is released (provides keyNumber)
- `keySlideOn`: Emitted when mouse slides over a key
- `keySlideOff`: Emitted when mouse slides off a key
