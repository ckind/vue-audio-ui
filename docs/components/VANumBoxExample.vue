<template>
  <div>
    <div class="example">
      <div class="knob">
        <v-a-num-box v-model="modelValue" :width="50"/>
      </div>

      <div class="props">
        <div>
          <label for="modelValue">modelValue: </label>
          <span id="modelValue" name="modelValue"> {{ modelValue }}</span>
        </div>
      </div>
    </div>

    <p><strong>Props</strong></p>

    <PropsTable :propsToDisplay="propsToDisplay" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VANumBox } from "vue-audio-ui";
import PropsTable from "./PropsTable.vue";


const modelValue = ref(5);
const propsToDisplay = ref(VANumBox.props);
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
