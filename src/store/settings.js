// We make sure two create separate mutations for each setting,
// so the state is more fine-grained and we can restore state from local storage
export default {
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