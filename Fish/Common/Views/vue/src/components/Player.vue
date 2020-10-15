<!-- Renders a single Hexagon tile with given size unless isActive is false, in which case the tile is hidden. -->
<template lang="pug">
  .player(:class='{current: isCurPlayer}')
    div.player-name {{name}}
    div.color-indicator(:style='colorStyle')
    div.unplaced-penguins {{unplacedPenguins}} remaining
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Player",
  props: {
    name: { type: String, required: true },
    unplacedPenguins: { type: Number, required: true },
    color: { type: String, required: true },
    isCurPlayer: { type: Boolean, required: true },
  },
  computed: {
    colorStyle() {
      return {
        ['background-color']: `${this.color}`,
      };
    },
  },
});
</script>

<style lang="scss">
  .player {
    background-color: lightskyblue;
    display: inline-flex;
    flex-direction: row;
    gap: 5px;
    min-width: 160px;
  }
  .color-indicator {
    height: 15px;
    width: 15px;
    border-radius: 50%;
    display: inline-block;
  }
  .current {
    border: 4px solid black;
  }
</style>
