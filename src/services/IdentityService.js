// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'

let state = {
    token: null
}

export default new Service({

    name: 'identity',
    state,

    hasIdentity() {
        return Boolean(state.token)
    },

    setIdentity(token) {
        state.token = token
    }
    
});