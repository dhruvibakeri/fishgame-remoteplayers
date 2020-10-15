<!-- Renders a single Hexagon tile with given size unless isActive is false, in which case the tile is hidden. -->
<template lang="pug">
  .roster
    div.title Players
    .players
      div(v-for='(player, index) in game.players' :key='index')
        div.player-number=`${index + 1}.`
        Player(
          :name='player.name' 
          :unplacedPenguins='game.remainingUnplacedPenguins.get(player)' 
          :color='game.playerToColorMapping.get(player)'
          :isCurPlayer='isCurPlayer(player)'
        )
</template>

<script lang="ts">
import Vue from "vue";
import { Game, Player as PlayerType } from "../../../../../Common/Controller/types/state";
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
    isCurPlayer(player: PlayerType) {
      return this.game.curPlayer === player;
    },
  },
});
</script>

<style lang="scss">
  .title {
    font-size: 22px;
  }
  .players {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
</style>
