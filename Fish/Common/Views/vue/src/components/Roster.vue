<!-- Renders a single Hexagon tile with given size unless isActive is false, in which case the tile is hidden. -->
<template lang="pug">
    div Player Roster
    div(v-for='player in players')
      div(v-if='player === curPlayer') Current Player
      Player(:player='player')
      
</template>

<script lang="ts">
import Vue from "vue";
import { Player as PlayerType } from "../../../../../Common/Controller/types/state";
import Player from "./Player.vue";

export default Vue.extend({
  name: "Roster",
  components: {
    Player
  },
  props: {
    players: { type: Object as () => Array<PlayerType>, required: true },
    curPlayer: { type: Object as () => PlayerType, required: true }
  },
});
</script>

<style lang="scss">
</style>
