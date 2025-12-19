import DefaultTheme from 'vitepress/theme'
import '@pkg/vue-audio-ui.css'
import VAudioUI from '@pkg/vue-audio-ui'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(VAudioUI)
  }
}