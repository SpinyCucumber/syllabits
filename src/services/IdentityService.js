// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'
import jwt_decode from 'jwt-decode'

const PREEMPT = 10000;

let refreshTimeout = null;

const module = {
    state() {
        return {
            token: null,
        }
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
    },
    getters: {
        claims(state) {
            return jwt_decode(state.token);
        },
        hasIdentity(state) {
            return state.token !== null;
        },
    },
    actions: {
        loadIdentity({commit, getters}, token) {
            commit('setToken', token);
            // Schedule token refresh
            // Make sure to cancel previously scheduled refresh if applicable
            const delta = (getters.claims.exp * 1000) - Date.now() - PREEMPT;
            if (refreshTimeout) clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(() => {}, delta);
        },
        clearIdentity({commit}) {
            commit('setToken', null);
            // Cancel refresh if applicable
            if (refreshTimeout) clearTimeout(refreshTimeout);
        },
    }
}

class IdentityService extends Service {

    constructor() {
        super({name: 'identity'});
    }

    install(vue, options) {
        // Must pass store as option
        options.store.registerModule('identity', module);
        super.install(vue);
    }

}

export default new IdentityService();