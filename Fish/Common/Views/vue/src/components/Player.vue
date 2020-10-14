<!-- Renders a single Hexagon tile with given size unless isActive is false, in which case the tile is hidden. -->
<template lang="pug">
    div.player-name
      span 'player.name'
      span.color-indicator(:style='{fill: color}')
    div.player-unplaced-penguins
      'unplacedPenguins' remaining
</template>

<script lang="ts">
import Vue from "vue";
import { Player } from "../../../../Controller/types/state";
import { PenguinColor } from "../../../../Controller/types/board";

export default Vue.extend({
  name: "Player",
  props: {
    player: { type: Object as () => Player, required: true },
    unplacedPenguins: { type: Object as () => number, required: true },
    color: { type: Object as () => PenguinColor, required: true }
  }
});
</script>

<style lang="scss">
.color-indicator {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  display: inline-block;
}
</style>
