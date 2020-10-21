<!-- 
Renders a Roster of players.
A rendered Roster consists of the rendering for each of the given Game state's 
Players, along with a number for each Player which indicates the ordering of
turns within the Game's roster of players.
-->
<template lang="pug">
  .roster
    div.title Players
    .players
      div(v-for='(player, index) in game.players' :key='index')
        div.player-number {{index + 1}}.
        Player(
          :player='player' 
          :unplacedPenguins='game.remainingUnplacedPenguins.get(player.color)' 
          :isCurPlayer='isCurPlayer(player)'
        )
</template>

<script lang="ts">
import Vue from "vue";
import { Game, Player as PlayerType } from "../../../../../Common/state";
import Player from "./Player.vue";

export default Vue.extend({
  name: "Roster",
  components: {
    Player,
  },
  props: {
    game: { type: Object as () => Game, required: true },
  },
  methods: {
    /**
     * Check whether the given player is the current player.
     * 
     * @param player the player to check
     * @return whether the given player is the current player.
     */
    isCurPlayer(player: PlayerType) {
      return this.game.players[this.game.curPlayerIndex].color === player.color;
    },
  },
});
</script>

<style lang="scss">
  .title {
    font-size: 24px;
  }
  .players {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
</style>
