import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import Buefy from 'buefy'

import { apolloProvider } from './apollo'
import { Constants, Assets, Translation, Reminders, Notes } from './services'

import './styles/syllabits.scss'

// Install Vue plugins!
// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(Constants);
Vue.use(Assets);
Vue.use(Translation);
Vue.use(Reminders);
Vue.use(Notes);

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
