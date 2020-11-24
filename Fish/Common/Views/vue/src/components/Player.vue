
<template lang="pug">
  .player(:class='{current: isCurPlayer}')
    div.player-name {{player.name}}
    div.color-indicator(:style='colorStyle')
    div.unplaced-penguins Placing stage: {{unplacedPenguins}} left
    div.player-score Score : {{playerScore}}
</template>

<script lang="ts">
import Vue from "vue";
import { Player } from "../../../../state";

interface ColorStyle {
  ['background-color']: string; 
}

export default Vue.extend({
  name: "Player",
  props: {
    player: { type: Object as () => Player, required: true },
    unplacedPenguins: { type: Number, required: true },
    playerScore: {type: Number, required: true },
    isCurPlayer: { type: Boolean, required: true },
  },
  computed: {
    /** 
     * Used to dynamically change the color of the player's color indicator 
     * based upon the player's supplied color.
     */ 
    colorStyle(): ColorStyle {
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
  .player-score {
    font-size: 20px;
    font-weight: 900;
  }
</style>
