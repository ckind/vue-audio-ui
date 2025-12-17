<template>
  <div>
    <div class="example">
      <audio controls>
        <source
          src="@public/audio/.mp3"
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>

      <!-- <div class="meter">
        <v-a-digital-meter
          class="ui-component"
          type="peak"
          :input="postGain"
          :drawMarkers="true"
        />
      </div> -->

      <div class="props">

      </div>
    </div>

    <p><strong>Props</strong></p>
    <!-- <PropsTable :propsToDisplay="propsToDisplay" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
// import { VADigitalMeter } from "@pkg/v-audio-ui";
import PropsTable from "./PropsTable.vue";

// const propsToDisplay = ref(VADigitalMeter.props);

</script>

<style scoped>
.example {
  display: flex;
  align-items: center;
  gap: 2em;
}
.meter {
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
