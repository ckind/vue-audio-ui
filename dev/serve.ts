import { createApp } from 'vue';
import Dev from './serve.vue';
import VAudioUi from '@/entry.esm';

const app = createApp(Dev);
app.use(VAudioUi);

app.mount('#app');
