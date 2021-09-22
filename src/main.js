import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'

import 'buefy/dist/buefy.css'
import './styles/syllabits.css'
import '@mdi/font/css/materialdesignicons.min.css'

import { createProvider } from './vue-apollo'
import { Constants } from './services'

// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(Constants);

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider: createProvider(),
  render: function (h) { return h(App) }
}).$mount('#app')
