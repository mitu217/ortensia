const tsLoader = require('./ts-loader')

module.exports = {
    env: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
    /*
    ** Headers of the page
    */
    head: {
      title: 'nuxt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Nuxt.js project' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    /*
    ** Add axios globally
    */
    build: {
      vendor: ['axios'],
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