import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';

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

export default new Vuex.Store({
    modules: { settings }
})
