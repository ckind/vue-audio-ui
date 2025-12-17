<template>
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>type</th>
        <th>required</th>
        <th>default</th>

            <!-- type?: PropType<T> | true | null;
    required?: boolean;
    default?: D | DefaultFactory<D> | null | undefined | object;
    validator?(value: unknown, props: Data): boolean; -->
      </tr>
    </thead>
    <tbody>
      <tr v-for="(settings, prop) in propsToDisplay" :key="prop">
        <td>{{ prop }}</td>
        <td>{{ settings.type.name }}</td>
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
  }});

onMounted(() => {
  console.log("PropsTable mounted with props:", props.propsToDisplay);
});

</script>

# My Dynamic Table

