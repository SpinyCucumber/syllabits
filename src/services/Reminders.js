import Service from './Service'
import TranslationService from './TranslationService'
import { ToastProgrammatic as Toast } from 'buefy'

const toastOptions = {
    type: 'is-info',
    duration: 8000,
}

let shown = new Set();

function display(key) {
    Toast.open({
        message: TranslationService.get('reminders.' + key),
        ...toastOptions,
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