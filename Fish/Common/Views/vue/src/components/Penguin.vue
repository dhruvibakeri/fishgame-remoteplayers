<!-- Renders a single Penguin. Note: had to paste svg directly in html template to prevent import errors during tests.-->
<template lang="pug">
  .penguin(:style='{fill: color, ...penguinAbsolutePosition()}')
    //- Penguin svg from the Noun Project
    svg(version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 300.1 500" style="enable-background:new 0 0 300.1 500;" xml:space="preserve")
      path.penguin-path(d="M223.3,126.3C192.1,80.1,218.8,0,143.9,0c0,0-30,0-43.1,20c-8.5,12.9-65,8.1-70.5,34.1c62.3-7,102.4,12.1,52.6,80.8 C39.7,194.4-23.6,350.1,9,350.1l47.7-42c0,68.1,3.6,118.9,22.9,149.7h0.1c2.3,3.3,4.7,6.4,7.4,9.2c-12.5,6.5-18.5,14.3-21.4,20.7 c-2.7,6,2.3,12.5,9.1,12.3h76.4h76.4c6.8,0.3,11.7-6.3,9.1-12.3c-2.8-6.4-8.8-14.1-21.4-20.7c2.7-2.8,5.1-5.9,7.4-9.2h-0.2 c19.3-30.8,22.9-81.6,22.9-149.7l45.6,43.1C323.4,351.2,261.5,182.9,223.3,126.3z M134.3,22.3c3.5,0,6.3,2.8,6.3,6.3 s-2.8,6.3-6.3,6.3s-6.3-2.8-6.3-6.3C128,25.2,130.8,22.3,134.3,22.3z M194.3,437.6c-7.6,13.6-19.9,24.1-34.8,29 c-3.1,1-6,1.7-8.3,1.8c-2.4-0.1-5.4-0.8-8.6-1.8c-15-4.9-27.5-15.4-35.1-29.1C90.6,407.2,81,358.5,81,303.6c0-92,27-92.5,70-92.5 c42.9,0,70,0.5,70,92.5C220.9,358.5,211.3,407.3,194.3,437.6z")
</template>

<script lang="ts">
import Vue from "vue";
import { BoardPosition } from "../../../../board";
import { CSSAbsolutePosition } from "../types/visualization";

export default Vue.extend({
  name: "Penguin",
  props: {
    color: { type: String, required: true },
    position: { type: Object as () => BoardPosition, required: true},
    tileSize: { type: Number, required: true },
  },
  methods: {
    // Calculates absolute position in px of hexagon tile based on given col and row of tile
    penguinAbsolutePosition(): CSSAbsolutePosition {
      // Use helper functions to calculate horizontal and vertical positioning, add 10 for board padding
      const vertTransform = this.absoluteVerticalPosition() + 10;
      const horizTransform = this.absoluteHorizontalPosition() + 10;
      return {
        left: `${horizTransform}px`,
        top: `${vertTransform}px`,
      };
    },
    // Calculates the vertical position based on given row
    absoluteVerticalPosition(): number {
      return (this.position.row) * this.tileSize + this.tileSize * .75;
    },
    // Calculates the horizontal position based on given row and col
    absoluteHorizontalPosition(): number {
      return this.position.row % 2 === 1
        ? this.position.col * (this.tileSize * 4) + this.tileSize * 2 + this.tileSize * 1.3
        : this.position.col * (this.tileSize * 4) + this.tileSize * 1.3;
    },
  },
});
</script>

<style lang="scss">
.penguin {
  position: absolute;
  svg {
    height: 50px;
    width: auto;
  }
}
</style>
