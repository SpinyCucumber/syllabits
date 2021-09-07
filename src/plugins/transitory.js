// Allows marking routes as "transitory." Transitory views meant to be used as a portal to other views.
// Also allows checking whether routes are transitory.

export default {
    install(Vue) {
        // Add methods for checking route status
        Vue.prototype.$isTransitory = function(route) {
            return Boolean(route.meta.transitory);
        };
    }
};