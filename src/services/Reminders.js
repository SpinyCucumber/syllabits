import Service from './Service'
import Translation from './Translation'
import { ToastProgrammatic, DialogProgrammatic } from 'buefy'

const toastOptions = {
    type: 'is-info',
    duration: 8000,
}

let shown = new Set();

export default new Service({
    
    name: 'reminders',

    showMessage(key) {
        if (shown.has(key)) return false;
        ToastProgrammatic.open({
            ...Translation.get('reminders.' + key),
            ...toastOptions,
        });
        shown.add(key);
        return true;
    },

    showDialog(key, options) {
        if (shown.has(key)) return false;
        DialogProgrammatic.confirm({
            ...Translation.get('reminders.' + key),
            ...options,
        })
        shown.add(key);
        return true;
    },

})