<!-- Renders a group of fish with the given number of fish (numFish). -->
<template lang="pug">
    .fish-group
        //- Display a fish for every number in numFish
        div(v-for='singleFish in numFish')
            Fish
</template>

<script lang="ts">
import Vue from "vue";
import Fish from "./Fish.vue";

export default Vue.extend({
  name: "FishContainer",
  props: {
    numFish: { type: Number, required: true },
  },
  components: {
    Fish,
  },
});
</script>

<style lang="scss">
.fish-group {
  height: 100%;
  max-width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>
