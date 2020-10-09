<!-- Renders a single Fish. -->
<template lang="pug">
    img.fish(:src='fish')
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Fish",
  data() {
    return {
      fish: require("../../public/fish.svg"),
    };
  },
});
</script>

<style lang="scss">
.fish {
  height: 25px;
  width: auto;
}
</style>
