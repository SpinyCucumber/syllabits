// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'
import jwt_decode from 'jwt-decode'

const PREEMPT = 10000;
let refreshTimeout = null;

let state = {
    token: null
}

function refreshIdentity() {
    // TODO
    state.token = null;
}

export default new Service({

    name: 'identity',
    state,

    hasIdentity() {
        return Boolean(state.token)
    },

    setIdentity(token) {
        state.token = token
        const claims = jwt_decode(token);
        // Schedule token refresh
        // Make sure to cancel previously scheduled refresh if applicable
        const delta = (claims.exp * 1000) - Date.now() - PREEMPT;
        if (refreshTimeout) clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(refreshIdentity, delta);
    }
    
});