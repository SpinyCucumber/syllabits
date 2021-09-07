import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'

import 'buefy/dist/buefy.css'
import './syllabits.css'
import '@mdi/font/css/materialdesignicons.min.css'

// Buefy bundle size is actually small
Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
