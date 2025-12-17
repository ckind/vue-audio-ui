<template>
  <div v-if="!started" class="setup" @click="onSetupClick">
    <h1>click to enable audio</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  Name: "AudioContextSetup",
	data() {
		return {
			started: false
		}
	},
  methods: {
    onSetupClick() {
      this.started = true;
    }
  }
});
</script>

<style scoped>
.setup {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
	z-index: 100000000;
	cursor: pointer;
}
</style>
