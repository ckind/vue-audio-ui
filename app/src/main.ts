import { createApp } from 'vue'
import App from './App.vue'
import '../../pkg/dist/v-audio-ui.css'
import VAudioUI from '../../pkg/dist/v-audio-ui'

const app = createApp(App);

app.use(VAudioUI);
app.mount('#app');
