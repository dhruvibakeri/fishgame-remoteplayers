<!-- Renders a grid of hexagons from 2D array of tiles. -->
<template lang="pug">
    div.board
        div.col(v-for='tileCol, colIndex in board.tiles' :key='colIndex' msg="blah")
            div.hexagon(v-for='tile, rowIndex in tileCol' :style='tileAbsolutePosition(colIndex, rowIndex, tile)')
                Tile(:size='size' :isActive='tile.isActive' :numFish='tile.numOfFish' :key='rowIndex')
</template>

<script lang="ts">
import Vue from "vue";
import Tile from "./Tile.vue";
import { Board } from "../../../../../Common/Controller/types/board";
import { AbsolutePosition } from "../types/visualization";

export default Vue.extend({
  name: "Board",
  components: {
    Tile,
  },
  props: {
    board: { type: Object as () => Board, required: true},
  },
  data() {
    return {
      size: 80,
    };
  },
  methods: {
    // Calculates absolute position in px of hexagon tile based on given col and row of tile
    tileAbsolutePosition(col: number, row: number): AbsolutePosition {
      // Use helper functions to calculate horizontal and vertical positioning, add 10 for board padding
      const vertTransform = this.absoluteVerticalPosition(row) + 10;
      const horizTransform = this.absoluteHorizontalPosition(col, row) + 10;
      return {
        left: `${horizTransform}px`,
        top: `${vertTransform}px`,
      };
    },
    // Calculates the vertical position based on given row
    absoluteVerticalPosition(row: number): number {
      return row * this.size;
    },
    // Calculates the horizontal position based on given row and col
    absoluteHorizontalPosition(col: number, row: number): number {
      return row % 2 === 1
        ? col * (this.size * 4) + this.size * 2
        : col * (this.size * 4);
    },
  },
});
</script>

<style lang="scss">
.board {
  background-color: lightskyblue;
  height: 404px;
  width: 1044px;
}
.hexagon {
  position: absolute;
}
</style>
