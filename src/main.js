import Vue from 'vue'
import App from './App.vue'
import router from './router'
import identity from './plugins/identity'
import Buefy from 'buefy'

import 'buefy/dist/buefy.css'

// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(identity);

Vue.config.productionTip = false;

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
