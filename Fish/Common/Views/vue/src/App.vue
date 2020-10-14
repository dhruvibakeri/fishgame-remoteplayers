<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    Game(:game='game')
</template>

<script lang="ts">
import Vue from "vue";
import Game from "./components/Game.vue";
import { createHoledOneFishBoard } from "../../../Controller/src/boardCreation";
import { createState } from "../../../Controller/src/stateModification";
import { Player } from "../../../Controller/types/state";
import { Board, BoardPosition, PenguinColor } from "../../../Controller/types/board";

export default Vue.extend({
  name: "App",
  components: {
    Game
  },
  data() {
    return {
      // Create board for visualization using helper funciton from Controller
      player1: { name: "foo", age: 21 },
      player2: { name: "bar", age: 42 },
      holePosition: { col: 0, row: 0 },
      player1PenguinPosition1: { row: 1, col: 1 },
      player1PenguinPosition2: { row: 2, col: 2 },
      player2PenguinPosition1: { row: 1, col: 2 },
      player2PenguinPosition2: { row: 3, col: 0 },
      player1Color: PenguinColor.White,
      player2Color: PenguinColor.Red
    };
  },
  created() {
    this.game = {
      ...createState(
        [this.player1, this.player2], 
        new Map([[this.player1, PenguinColor.White], [this.player2, PenguinColor.Red]]), 
        createHoledOneFishBoard(4, 3, [this.holePosition], 1) as Board
      ),
      penguinPositions: new Map([
        [this.player1PenguinPosition1, { color: this.player1Color }], 
        [this.player1PenguinPosition2, { color: this.player1Color }],
        [this.player2PenguinPosition1, { color: this.player2Color }], 
        [this.player2PenguinPosition2, { color: this.player2Color }],
      ])
    }
  } 
});
</script>
