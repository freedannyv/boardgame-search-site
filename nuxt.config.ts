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
  // Private (server only)
  supabaseSecretKey: '',
  bggApiToken: '',
  bggUsername: '',
  bggPassword: '',
  
  public: {
    supabaseUrl: '',
    supabaseKey: '',
    environment: 'development',
    netlifyContext: 'development',
  }
},

  supabase: {
    types: false,
    useSsrCookies: true,
    redirectOptions: {
      login: '/auth',
      callback: '/confirm',
      exclude: ['/', '/reset', '/update'],
      saveRedirectToCookie: true,
    },
  },
})