import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

// Create a settings module
const settings = {
    state() {
        return {
            settings: {
                hints: true,
                readability: false,
            }
        }
    },
    getters: { getField },
    mutations: { updateField },
}

// Construct persist plugin
// We only persist settings, as the refresh token is stored in cookies
// TODO Look into
const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
    modules: ['settings'],
})

export default new Vuex.Store({
    modules: { settings },
    plugins: [vuexLocal.plugin],
})
