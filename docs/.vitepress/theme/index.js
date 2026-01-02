import DefaultTheme from 'vitepress/theme'
import VueAudioUI from 'vue-audio-ui'
import 'vue-audio-ui/style.css'
import './custom.css'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(VueAudioUI)
  }
}