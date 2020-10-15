<!-- Instantiates Vue app. -->
<template lang="pug">
  div#app
    Game(:game='game')
</template>

<script lang="ts">
import Vue from "vue";
import Game from "./components/Game.vue";
import { Game as GameState } from "../../../Controller/types/state";

export default Vue.extend({
  name: "App",
  components: {
    Game,
  },
  props: {
    game: { type: Object as () => GameState, required: true },
  },
});
</script>
