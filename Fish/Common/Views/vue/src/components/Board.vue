<!-- Renders a grid of hexagon tiles from given board. -->
<template lang="pug">
    div.board(:style='calculateBoardSize()')
        div.col(v-for='tileCol, colIndex in board.tiles' :key='colIndex' msg="blah")
            div.tile-container(v-for='tile, rowIndex in tileCol' :style='tileAbsolutePosition(colIndex, rowIndex, tile)')
                Tile.tile(:size='tileSize' :numFish='tile.numOfFish' :key='rowIndex')
</template>

<script lang="ts">
import Vue from "vue";
import Tile from "./Tile.vue";
import { Board } from "../../../../../Common/Controller/types/board";
import { CSSAbsolutePosition, CSSElementSize } from "../types/visualization";

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
      tileSize: 80,
    };
  },
  methods: {
    // Calculates absolute position in px of hexagon tile based on given col and row of tile
    tileAbsolutePosition(col: number, row: number): CSSAbsolutePosition {
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
      return row * this.tileSize;
    },
    // Calculates the horizontal position based on given row and col
    absoluteHorizontalPosition(col: number, row: number): number {
      return row % 2 === 1
        ? col * (this.tileSize * 4) + this.tileSize * 2
        : col * (this.tileSize * 4);
    },
    // Calculates the height and width of the board (blue background)
    // Based on number of tiles and tileSize, with 5px added for padding
    calculateBoardSize(): CSSElementSize {
      const height = this.calculateBoardHeight() + 5;
      const width = this.calculateBoardWidth() + 5;
      return {
        height: `${height}px`,
        width: `${width}px`,
      };
    },
    // Calculates board height
    calculateBoardHeight(): number {
      return this.tileSize * (this.board.tiles[0].length + 1);
    },
    // Calculates board width
    calculateBoardWidth(): number {
      return 4 * this.tileSize * this.board.tiles.length + this.tileSize;
    },
  },
});
</script>

<style lang="scss">
.board {
  background-color: lightskyblue;
}
.tile-container {
  position: absolute;
}
</style>
