// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'
import jwt_decode from 'jwt-decode'
import { apolloClient } from '@/apollo'
import { Refresh } from '@/queries'

const PREEMPT = 10000;

let refreshTimeout = null;

const module = {
    state() {
        return {
            // Token has three possible values, each of which correspond to a different state
            // Can be undefined, which means user's identity is YET to be determined (in an unknown state)
            // Can be null, which means user is not logged in/no identity
            // Can be an actual access token which corresponds to a user account (has an identity)
            token: undefined,
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
        determined(state) {
            return state.token !== undefined;
        }
    },
    actions: {
        // Attempts to obtain a new access token by querying the server.
        // If our cookies contain an unexpired refresh token, this should succeed
        refreshIdentity({dispatch}) {
            apolloClient.mutate({ mutation: Refresh })
                .then(result => result.data.refresh)
                .then(({result}) => {
                    dispatch('loadIdentity', result);
                });
        },
        loadIdentity({commit, getters}, token) {
            commit('setToken', token);
            // If token is valid, schedule token refresh
            // Make sure to cancel previously scheduled refresh if applicable
            if (token !== null) {
                const delta = (getters.claims.exp * 1000) - Date.now() - PREEMPT;
                if (refreshTimeout) clearTimeout(refreshTimeout);
                // TODO
                refreshTimeout = setTimeout(() => {}, delta);
            }
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

    install(vue, {store}) {
        super.install(vue);
        // Must pass store as option
        store.registerModule('identity', module);
        // Grab an initial access token
        store.dispatch('refreshIdentity');
    }

}

export default new IdentityService();