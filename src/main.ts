import Vue from 'vue';
import iView from 'iview';
import App from './App.vue';
import router from './router';

import 'iview/dist/styles/iview.css';
import '@/styles/index.less';

Vue.config.productionTip = false;
Vue.use(iView);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
