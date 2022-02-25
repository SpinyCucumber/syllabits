import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import identity from './identity'
import settings from './settings'

Vue.use(Vuex)

// Construct persistence plugin
// We only persist settings, as the refresh token is stored in cookies
const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
    modules: ['settings'],
});

export default new Vuex.Store({
    modules: { settings, identity },
    plugins: [vuexLocal.plugin],
    getters: {
        ready(state) {
            return state.identity.token !== undefined;
        },
    },
    actions: {
        init({dispatch}) {
            return Promise.all([
                dispatch('refreshIdentity')
            ]);
        },
    }
})
