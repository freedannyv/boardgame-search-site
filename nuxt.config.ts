// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase'
  ],
  runtimeConfig: {
    databaseUrl: '',
    bggApiToken: process.env.BGG_API_TOKEN,
    public: {
      BGG_API_TOKEN: process.env.BGG_API_TOKEN,
      supabaseUrl: '',
      supabaseKey: '',

    }
  },

  supabase: {
    types: false,
    useSsrCookies: true,
    redirectOptions: {
      login: '/auth',
      callback: '/confirm',
      exclude: ['/', '/reset', '/update'], // Add public routes here
      saveRedirectToCookie: true,
    },
  },
})