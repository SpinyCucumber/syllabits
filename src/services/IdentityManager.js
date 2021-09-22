// Handles tracking user identity.
// This handling JWTs as well as things like admin status.
import Service from './Service'

export default new Service({

    name: 'identity',

    state: {

    },

    hasIdentity() {
        // TODO
        return false;
    }
    
});