<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    Board
</template>

<script lang="ts">
import Vue from "vue";
import Board from "./components/Board.vue";

export default Vue.extend({
  name: "App",
  components: {
    Board
  }
});
</script>
