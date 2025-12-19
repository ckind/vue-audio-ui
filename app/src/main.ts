import { createApp } from 'vue'
import App from './App.vue'
import '../../pkg/dist/vue-audio-ui.css'
import VAudioUI from '../../pkg/dist/vue-audio-ui'

const app = createApp(App);

app.use(VAudioUI);
app.mount('#app');
