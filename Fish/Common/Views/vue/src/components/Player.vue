<!-- 
Renders a single Player. 
A rendered Player consist of the Player's name, an indicator of the color of 
their Penguins, and a count of how many Penguins they have left to place.
Whether this player is the current player is also denoted by a black border 
around the Player's rendering.
-->
<template lang="pug">
  .player(:class='{current: isCurPlayer}')
    div.player-name {{player.name}}
    div.color-indicator(:style='colorStyle')
    div.unplaced-penguins {{unplacedPenguins}} penguins left to place
</template>

<script lang="ts">
import Vue from "vue";
import { Player } from "../../../../state";

export default Vue.extend({
  name: "Player",
  props: {
    player: { type: Object as () => Player, required: true },
    unplacedPenguins: { type: Number, required: true },
    isCurPlayer: { type: Boolean, required: true },
  },
  computed: {
    /** 
     * Used to dynamically change the color of the player's color indicator 
     * based upon the player's supplied color.
     */ 
    colorStyle() {
      return {
        ['background-color']: `${this.player.color}`,
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
    align-items: center;
  }
  .player-name {
    font-size: 20px;
    font-weight: 900;
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
