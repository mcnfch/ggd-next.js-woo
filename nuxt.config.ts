import pkg from './package.json';

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['nuxt-graphql-request', '@vueuse/nuxt', '@nuxt/ui', '@nuxt/image', 'notivue/nuxt', '@nuxthub/core', '@nuxtjs/sitemap'],
  future: { compatibilityVersion: 4 },

  devServer: {
    port: 3010
  },

  nitro: {
    port: 3010
  },

  notivue: {
    position: 'top-center',
    limit: 3,
    notifications: {
      global: {
        duration: 3000,
      },
    },
  },

  css: ['notivue/notification.css', 'notivue/animations.css'],

  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },

  graphql: {
    clients: {
      default: {
        endpoint: process.env.GQL_HOST || '',
      },
    },
  },

  site: {
    url: 'https://groovygallerydesigns.com'
  },

  sitemap: {
    urls: [
      '/',
      '/about',
      '/gallery',
      '/contact'
    ]
  },

  compatibilityDate: '2025-01-18',
})