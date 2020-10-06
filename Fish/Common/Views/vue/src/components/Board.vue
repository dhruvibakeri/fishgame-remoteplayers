<!-- Renders a grid of hexagons from 2D array of tiles. -->
<template lang="pug">
    div.board 
        .col(v-for='tileCol, colIndex in tiles' :key='index')
            .hexagon(v-for='tile, rowIndex in tileCol' :style='tileAbsolutePosition(colIndex, rowIndex)')
                Tile(:size='size' :isActive='tile.isActive' :numFish='tile.numOfFish' :key='rowIndex')
</template>

<script lang>
import Tile from "./Tile";
export default {
  name: "HexagonGrid",
  components: {
    Tile
  },
  data() {
    return {
      size: 80,
      tiles: [
        [
          { isActive: false, numOfFish: 1 },
          { isActive: true, numOfFish: 5 },
          { isActive: true, numOfFish: 4 },
          { isActive: true, numOfFish: 3 }
        ],
        [
          { isActive: true, numOfFish: 2 },
          { isActive: true, numOfFish: 1 },
          { isActive: true, numOfFish: 1 },
          { isActive: true, numOfFish: 1 }
        ],
        [
          { isActive: true, numOfFish: 1 },
          { isActive: false, numOfFish: 1 },
          { isActive: true, numOfFish: 1 },
          { isActive: true, numOfFish: 1 }
        ]
      ]
    };
  },
  methods: {
    // Calculates absolute position in px of hexagon tile based on given col and row of tile
    tileAbsolutePosition(col, row) {
      // Use helper functions to calculate horizontal and vertical positioning, add 10 for board padding
      const vertTransform = this.absoluteVerticalPosition(row) + 10;
      const horizTransform = this.absoluteHorizontalPosition(col, row) + 10;
      return {
        left: `${horizTransform}px`,
        top: `${vertTransform}px`
      };
    },
    // Calculates the vertical position based on given row
    absoluteVerticalPosition(row) {
      return row * this.size;
    },
    // Calculates the horizontal position based on given row and col
    absoluteHorizontalPosition(col, row) {
      return row % 2 === 1
        ? col * (this.size * 4) + this.size * 2
        : col * (this.size * 4);
    }
  }
};
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
