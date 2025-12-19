<template>
  <div>
    <div class="example">
      <div class="knob">
        <v-a-knob
          class="eq-knob"
          v-model="modelValue"
          :size="size"
          :minValue="minValue"
          :maxValue="maxValue"
          :default="defaultValue"
          :step="step"
        />
      </div>

      <div class="knob">
        <v-a-knob
          class="eq-knob"
          v-model="modelValue"
          :size="size"
          :minValue="minValue"
          :maxValue="maxValue"
          :default="defaultValue"
          :step="step"
        >
          <img src="/assets/knob1.svg" alt="My SVG image">
        </v-a-knob>
      </div>

      <div class="props">
        <div>
          <label for="maxValue">maxValue: </label>
          <span id="maxValue" name="maxValue"> {{ maxValue }}</span>
        </div>

        <div>
          <label for="minValue">minValue: </label>
          <span id="minValue" name="minValue"> {{ minValue }}</span>
        </div>

        <div>
          <label for="modelValue">modelValue: </label>
          <span id="modelValue" name="modelValue"> {{ modelValue }}</span>
        </div>

        <div>
          <label for="height">size: </label>
          <span id="height" name="height"> {{ size }}</span>
        </div>

        <div>
          <label for="default">default: </label>
          <span id="default" name="default"> {{ defaultValue }}</span>
        </div>

        <div>
          <label for="step">step: </label>
          <span id="step" name="step"> {{ step }}</span>
        </div>
      </div>
    </div>

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { VAKnob } from "@pkg/vue-audio-ui";

import PropsTable from "./PropsTable.vue";

const minValue = ref(-10);
const maxValue = ref(10);
const modelValue = ref(5);
const size = ref(60);
const defaultValue = ref(5);
const step = ref(2);
const propsToDisplay = ref(VAKnob.props);
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
