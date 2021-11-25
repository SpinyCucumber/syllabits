import Service from './Service'
import TranslationService from './TranslationService'
import { ToastProgrammatic as Toast } from 'buefy'

let shown = new Set();

function display(key) {
    Toast.open({
        message: TranslationService.get('reminders.' + key),
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