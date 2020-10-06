<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    Board(:board='board')
</template>

<script lang="ts">
import Vue from "vue";
import Board from "./components/Board.vue";
import { createHoledOneFishBoard } from "../../../Controller/src/boardCreation";

export default Vue.extend({
  name: "App",
  components: {
    Board,
  },
  data() {
    return {
      board: createHoledOneFishBoard(4, 3, [{ xPos: 0, yPos: 0 }], 1),
    };
  },
});
</script>
