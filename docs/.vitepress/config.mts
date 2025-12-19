import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "v-audio-ui-docs",
  description: "Official Documentation for v-audio-ui",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Components', link: '/component-library' }
    ],

    sidebar: [
      {
        // text: 'Examples',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Components', link: '/component-library' },
          { text: 'Web Audio API and SSR', link: '/web-audio-api-and-ssr' },
          { text: 'Contributing', link: '/contributing' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ckind/v-audio-ui' }
    ]
  },
  vite: {
    resolve: {
      alias: {
        // Alias '@pkg' to dist path of v-audio-ui pkg
        '@pkg': fileURLToPath(new URL('../../pkg/dist', import.meta.url)),
        '@public': fileURLToPath(new URL('../public', import.meta.url)),
      }
    }
  }
})
