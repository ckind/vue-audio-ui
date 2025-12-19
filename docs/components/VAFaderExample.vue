<template>
  <div>
    <div class="example">
      <div class="fader-container">
        <v-a-fader v-model="modelValue" :minValue="minValue" :maxValue="maxValue" :default="defaultValue" class="fader">
        </v-a-fader>
        <v-a-fader v-model="modelValue" :minValue="minValue" :maxValue="maxValue" :default="defaultValue" class="fader">
          <template #faderBackground>
            <img src="/assets/faderBackground_variant.svg" alt="My SVG image">
          </template>
          <template #faderHead>
            <img src="/assets/faderHead_variant.svg" alt="My SVG image">
          </template>
        </v-a-fader>
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
          <label for="height">height: </label>
          <span id="height" name="height"> {{ height }}</span>
        </div>

        <div>
          <label for="height">width: </label>
          <span id="height" name="height"> {{ width }}</span>
        </div>

        <div>
          <label for="default">default: </label>
          <span id="default" name="default"> {{ defaultValue }}</span>
        </div>
      </div>
    </div>

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VAFader } from "@pkg/vue-audio-ui";

import PropsTable from "./PropsTable.vue";

const minValue = ref(0);
const maxValue = ref(100);
const modelValue = ref(50);
const height = ref(200);
const width = ref(46);
const defaultValue = ref(50);
const propsToDisplay = ref(VAFader.props);

</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}

.fader-container {
  flex: 0 0 auto;
}

.fader {
  display: inline-block;
  margin: 0.25em;
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
