import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vue-audio-ui",
  description: "Official Documentation for vue-audio-ui",
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/pages/component-library' }
    ],

    sidebar: [
      {
        // text: 'Examples',
        items: [
          { text: 'Getting Started', link: '/pages/getting-started' },
          { text: 'Components', link: '/pages/component-library' },
          { text: 'Web Audio API and SSR', link: '/pages/web-audio-api-and-ssr' },
          { text: 'Contributing', link: '/pages/contributing' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ckind/vue-audio-ui' }
    ]
  },
  vite: {
    resolve: {
      alias: {}
    }
  }
})
