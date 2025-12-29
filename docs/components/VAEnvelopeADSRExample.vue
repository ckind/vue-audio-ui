<template>
  <div>
    <div class="example">
      <v-a-envelope-adsr v-model="envelope" :width="300" />

      <div class="props">
        <div>
          <label for="maxValue">envelope: </label>
          <span id="maxValue" name="maxValue"> {{ envelope }}</span>
        </div>
      </div>
    </div>

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup>
import { ref, defineProps, reactive } from "vue";
import { VAEnvelopeAdsr } from "vue-audio-ui";

import PropsTable from "./PropsTable.vue";

const envelope = ref({
  attack: 10,
  decay: 200,
  sustain: 0.6,
  release: 200,
});

const propsToDisplay = ref(VAEnvelopeAdsr.props);
</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.knob {
  flex: 0 0 auto;
}

.props {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.props input {
  width: 9rem;
}
</style>
