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
    // Environment detection
    isDev: process.env.NODE_ENV === 'development',
    isPreview: process.env.NETLIFY === 'true' && process.env.CONTEXT === 'deploy-preview',
    isProduction: process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production',
    
    // Private keys (only available on server-side)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    databaseUrl: process.env.DATABASE_URL,
    bggApiToken: process.env.BGG_API_TOKEN,
    
    public: {
      // Public keys (exposed to client-side)
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      BGG_API_TOKEN: process.env.BGG_API_TOKEN,
      
      // Environment indicators for client-side
      environment: process.env.NODE_ENV === 'development' ? 'staging' : 'production',
      netlifyContext: process.env.CONTEXT || 'development',
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