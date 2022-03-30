module.exports = {
  pluginOptions: {
    apollo: {
      enableEngine: false,
      lintGQL: false,
    }
  },
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'SyllaBits'
    }
  },
  // Have to explicitly transpile vue-cli-plugin-apollo
  transpileDependencies: ['vue-cli-plugin-apollo']
}
