<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    HexagonGrid
</template>

<script lang="ts">
import Vue from "vue";
import HexagonGrid from "./components/HexagonGrid.vue";

export default Vue.extend({
  name: "App",
  components: {
    HexagonGrid
  }
});
</script>
