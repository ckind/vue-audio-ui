import DefaultTheme from 'vitepress/theme'
import '@pkg/v-audio-ui.css'
import VAudioUI from '@pkg/v-audio-ui'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(VAudioUI)
  }
}