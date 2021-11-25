import Service from './Service'

let shown = new Set();

function display(key) {
    this.$buefy.toast.open({
        message: this.$translation.get('reminders.' + key),
        type: 'is-info'
    });
}

export default new Service({
    name: 'reminders',
    show(key) {
        if (!shown.has(key)) {
            display(key);
            shown.add(key);
        }
    }
})