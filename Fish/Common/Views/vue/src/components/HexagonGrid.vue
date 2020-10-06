<!-- Renders a grid of hexagons from 2D array of tiles. -->
<template lang="pug">
    div.board 
        .col(v-for='tileCol, colIndex in tiles' :key='index')
            .hexagon(v-for='tile, rowIndex in tileCol' :style='tileAbsolutePosition(colIndex, rowIndex)')
                Hexagon(:size='size' :isActive='tile.isActive' :key='rowIndex')
</template>

<script lang>
import Hexagon from "./Hexagon";
export default {
  name: "HexagonGrid",
  components: {
    Hexagon
  },
  data() {
    return {
      size: 20,
      tiles: [
        [
          { isActive: false },
          { isActive: true },
          { isActive: true },
          { isActive: true }
        ],
        [
          { isActive: true },
          { isActive: true },
          { isActive: true },
          { isActive: true }
        ],
        [
          { isActive: true },
          { isActive: false },
          { isActive: true },
          { isActive: true }
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
  height: 104px;
  width: 264px;
}
.hexagon {
  position: absolute;
}
</style>
