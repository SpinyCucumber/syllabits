import Service from './Service'
import TranslationService from './TranslationService'
import { ToastProgrammatic as Toast, DialogProgrammatic as Dialog } from 'buefy'

const toastOptions = {
    type: 'is-info',
    duration: 8000,
}

let shown = new Set();

export default new Service({
    name: 'reminders',

    showMessage(key) {
        if (shown.has(key)) return false;
        Toast.open({
            ...TranslationService.get('reminders.' + key),
            ...toastOptions,
        });
        shown.add(key);
        return true;
    },

    showDialog(key, options) {
        if (shown.has(key)) return false;
        Dialog.confirm({
            ...TranslationService.get('reminders.' + key),
            ...options,
        })
        shown.add(key);
        return true;
    },

})