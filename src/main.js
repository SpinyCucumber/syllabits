import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'

import { createProvider } from './apollo'
import { Constants, IdentityService, AssetService, TranslationService } from './services'

import './styles/syllabits.scss'

// Install Vue plugins!
// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(Constants);
Vue.use(IdentityService, {store});
Vue.use(AssetService);
Vue.use(TranslationService);

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider: createProvider(),
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
