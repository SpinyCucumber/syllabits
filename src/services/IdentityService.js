// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'
import jwt_decode from 'jwt-decode'

const PREEMPT = 10000;

const module = {
    state() {
        return {
            token: null,
            claims: null,
            refreshTimeout: null,
        }
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
        setClaims(state, claims) {
            state.claims = claims;
        },
        setRefreshTimeout(state, refreshTimeout) {
            state.refreshTimeout = refreshTimeout;
        }
    },
    actions: {
        load({state, commit, dispatch}, token) {
            const claims = jwt_decode(token);
            // Schedule token refresh
            // Make sure to cancel previously scheduled refresh if applicable
            const delta = (claims.exp * 1000) - Date.now() - PREEMPT;
            if (state.refreshTimeout) clearTimeout(state.refreshTimeout);
            const refreshTimeout = setTimeout(() => dispatch('refreshIdentity'), delta);
            // Commit mutations
            commit('setToken', token);
            commit('setClaims', claims);
            commit('setRefreshTimeout', refreshTimeout);
        },
        refreshIdentity() {
            // TODO
            commit('setToken', null);
        }
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