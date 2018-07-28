module.exports = function(config) {
    config.resolve.extensions = ['.vue', '.ts', '.js', '.json']
    config.module.rules.push({
      test: /\.ts$/,
      loader: 'ts-loader'
    })
    // Add TypeScript loader for vue files
    for (var rule of config.module.rules) {
      if (rule.loader === 'vue-loader') {
        rule.options.loaders.ts = 'ts-loader?{"appendTsSuffixTo":["\\\\.vue$"]}'
      }
    }
}