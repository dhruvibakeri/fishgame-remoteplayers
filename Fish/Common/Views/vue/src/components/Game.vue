<!-- 
Renders a single Game. 
A rendered Game consists of the Game's board, Penguins rendered on the board
at each of the Game's specified Penguin positions, and a Roster of all the players.
-->
<template lang="pug">
    .game
        Board(:board='game.board')
        div(v-for='[positionKey, penguin] of Array.from(game.penguinPositions)' :key='positionKey')
            Penguin(:color='penguin.color' :position='game.penguinPositions.get(positionKey)' :tileSize='80')
        Roster(:game='game')
</template>

<script lang="ts">
import Vue from "vue";
import Board from "./Board.vue";
import Penguin from "./Penguin.vue";
import Roster from "./Roster.vue";
import { Game } from "../../../../state";

export default Vue.extend({
  name: "Game",
  components: {
      Board,
      Penguin,
      Roster,
  },
  props: {
    game: { type: Object as () => Game, required: true},
  },
});
</script>

<style lang="scss">
.game {
    display: inline-flex;
    flex-direction: column;
}
</style>
