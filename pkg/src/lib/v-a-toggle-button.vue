<template>
  <button
    @click="onButtonClick"
    :class="[on ? 'button-on' : 'button-off', 'button']"
    :style="cssVars"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  Name: "VAToggleButton",
  props: {
    color: {
      required: false,
      type: String,
      default: "red",
    },
    label: {
      require: false,
      type: String,
      default: "",
    },
  },
  setup(props) {
    const on = ref(false);
    const cssVars = computed(() => {
      return {
        '--on-color': `${props.color}`
      }
    });

    function onButtonClick() {
      on.value = !on.value;
    }

    return { on, cssVars, onButtonClick };
  }
});
</script>

<style scoped>

button, input[type="submit"], input[type="reset"] {
	background: none;
	color: inherit;
	border-radius: 4px;
  border: solid 1px black;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}

.button {
  cursor: pointer;
}
.button-on {
  box-shadow: inset 0px 0px 10px 3px var(--on-color);
}
.button-off {
  box-shadow: inset 0px 0px 5px 5px lightgray;
}
</style>