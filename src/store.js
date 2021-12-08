import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

// Create a settings module
// We make sure two create separate mutations for each setting,
// so the state is more fine-grained and we can restore state from local storage
const settings = {
    state() {
        return {
            hints: true,
            readability: false,
        }
    },
    mutations: {
        hints(state, value) {
            state.hints = value;
        },
        readability(state, value) {
            state.readability = value;
        }
    },
    namespaced: true,
}

// Construct persist plugin
// We only persist settings, as the refresh token is stored in cookies
const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
    modules: ['settings'],
})

export default new Vuex.Store({
    modules: { settings },
    plugins: [vuexLocal.plugin],
})
