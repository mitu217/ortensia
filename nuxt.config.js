const tsLoader = require('./ts-loader')

module.exports = {
    /*
    ** Headers of the page
    */
    head: {
      title: 'ortensia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Ortensia' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,700,400italic|Material+Icons' }
      ]
    },
    /*
    ** Customize the progress bar color
    */
    loading: { color: '#448aff' },
    /*
    ** Build configuration
    */
    css: [
        { src: 'vue-material/dist/vue-material.min.css', lang: 'css' },
    ],
    plugins: [
        { src: '~/plugins/vue-material' }
    ],
    /*
    ** Add axios globally
    */
    build: {
      vendor: ['axios', 'vue-material'],
      /*
      ** Run ESLINT on save
      */
      extend (config, ctx) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
        tsLoader(config);
      },
    }
  }