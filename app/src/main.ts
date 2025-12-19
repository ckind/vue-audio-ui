import { createApp } from 'vue'
import App from './App.vue'
import 'vue-audio-ui/style.css'
import VAudioUI from 'vue-audio-ui'

const app = createApp(App);

app.use(VAudioUI);
app.mount('#app');
