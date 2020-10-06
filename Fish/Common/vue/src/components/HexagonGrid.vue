<template lang="pug">
    div.board
        .col(v-for='tileCol, colIndex in tiles' :key='index')
            .hexagon(v-for='tile, index in tileCol' :style='translateHexagon(colIndex, index)')
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
      size: 20
    };
  },
  computed: {
    tiles() {
      const tileArray = [];
      tileArray.push([
        { isActive: false },
        { isActive: true },
        { isActive: true },
        { isActive: true }
      ]);
      tileArray.push([
        { isActive: true },
        { isActive: true },
        { isActive: true },
        { isActive: true }
      ]);
      tileArray.push([
        { isActive: true },
        { isActive: false },
        { isActive: true },
        { isActive: true }
      ]);
      return tileArray;
    }
  },
  methods: {
    translateHexagon(col, row) {
      const vertTransform = row * this.size;
      const horizTransform =
        row % 2 === 1
          ? col * (this.size * 4) + this.size * 2
          : col * (this.size * 4);
      return {
        left: `${horizTransform + 10}px`,
        top: `${vertTransform + 10}px`
      };
    }
  }
};
</script>

<style lang="scss">
.board {
  background-color: lightskyblue;
  height: 110px;
  width: 270px;
}
.hexagon {
  position: absolute;
}
</style>
