<!-- Renders a single Fish. -->
<template lang="pug">
    .penguin(v-html='penguin' :style='{fill: color}')
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Penguin",
  props: {
      color: { type: String, required: true },
  },
  data() {
    return {
      penguin: require("!html-loader!../../public/penguin.svg"),
    };
  },
});
</script>

<style lang="scss">
.penguin {
  height: 50px;
  width: auto;
}
</style>
