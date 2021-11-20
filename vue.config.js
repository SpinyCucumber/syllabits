module.exports = {
  pluginOptions: {
    apollo: {
      enableEngine: false,
      lintGQL: false,
    }
  },
  // Have to explicitly transpile vue-cli-plugin-apollo
  transpileDependencies: ['vue-cli-plugin-apollo']
}
