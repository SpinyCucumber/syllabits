// Handles tracking user identity.
// This handling JWTs as well as things like admin status.

class IdentityManager {

    hasIdentity() {
        // TODO
        return false;
    }

}

export default {
    install(Vue) {
        Vue.identityManager = new IdentityManager();
    }
}