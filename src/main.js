import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'

import './styles/syllabits.scss'

import { createProvider } from './apollo'
import { Constants, IdentityService, AssetService, TranslationService } from './services'

// Install Vue plugins!
// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(Constants);
Vue.use(IdentityService);
Vue.use(AssetService);
Vue.use(TranslationService);

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider: createProvider(),
  render: function (h) { return h(App) }
}).$mount('#app')
