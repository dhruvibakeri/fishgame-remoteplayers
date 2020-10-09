<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    Board(:board='board')
    //- Currently rendering penguin in this root component to show penguin display/positioning functionality
    //- will be rendered downstream when penguin-related game play is further flushed out
    Penguin(color="white" :position='{row: 1, col: 1}' :tileSize='80')
</template>

<script lang="ts">
import Vue from "vue";
import Board from "./components/Board.vue";
import Penguin from "./components/Penguin.vue";
import { createHoledOneFishBoard } from "../../../Controller/src/boardCreation";

export default Vue.extend({
  name: "App",
  components: {
    Board,
    Penguin,
  },
  data() {
    return {
      // Create board for visualization using helper funciton from Controller
      board: createHoledOneFishBoard(4, 3, [{ col: 0, row: 0 }], 1),
    };
  },
});
</script>
