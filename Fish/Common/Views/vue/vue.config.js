let playerCount;
if (process.env.VUE_PLAYER_COUNT !== undefined) {
    playerCount = parseInt(process.env.VUE_PLAYER_COUNT);
    if (playerCount < 2 || playerCount > 4) {
        throw new Error("Player count must be between 2 and 4");
    }
}

module.exports = {
    chainWebpack: config => {
      config.plugin("define").tap(options => {
          options[0]["process.env"].PLAYER_COUNT = playerCount;
          return options;
      });
   }
};
