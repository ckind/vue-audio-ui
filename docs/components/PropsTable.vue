<template>
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>type</th>
        <th>required</th>
        <th>default</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(settings, prop) in propsToDisplay" :key="prop">
        <td>{{ prop }}</td>
        <td>{{ settings.type?.name ?? 'any' }}</td>
        <td>{{ settings.required }}</td>
        <td>{{ settings.default ?? '...' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { defineProps, onMounted } from "vue";

const props = defineProps({
  propsToDisplay: {
    type: Object,
    required: true
  }
});
</script>

# My Dynamic Table
