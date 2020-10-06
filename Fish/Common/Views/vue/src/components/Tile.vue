<!-- Renders a single Hexagon tile with given size unless isActive is false, in which case the tile is hidden. -->
<template lang="pug">
    div(v-if='isActive')
      svg( viewBox="0 0 3 2" type='button' :height='height' :width='width' xmlns="http://www.w3.org/2000/svg")
          polygon(@click='hexagonClick' points="0,1 1,2 2,2 3,1 2,0 1,0" fill="lightgray" stroke="lightskyblue" stroke-weight="1px" vector-effect="non-scaling-stroke")
      .fish-position
        FishGroup(:numFish='numFish')
</template>

<script lang="ts">
import Vue from "vue";
import FishGroup from "./FishGroup.vue";

export default Vue.extend({
  name: "Hexagon",
  props: {
    size: { type: Number, required: true },
    isActive: { type: Boolean, required: true },
    numFish: { type: Number, required: true }
  },
  components: {
    FishGroup,
  },
  computed: {
    // Calculates height for hexagon
    height(): number {
      return this.size * 2;
    },
    // Calculates width for hexagon
    width(): number {
      return this.size * 3;
    }
  },
  methods: {
    // Function to print message when hexagon is clicked
    hexagonClick(): void {
      console.log("hexagon clicked");
    }
  }
});
</script>

<style lang="scss">
  .fish-position {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
