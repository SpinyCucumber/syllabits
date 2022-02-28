import { Translation, Notes } from '@/services'
import { DialogProgrammatic } from 'buefy'

function showDialog(key, options) {
    DialogProgrammatic.alert({
        ...Translation.get('dialog.tutorial.' + key),
        ...Translation.get('dialog.tutorial.all'),
        ...options
    });
}

export default {
    steps: [
        (advance) => {
            showDialog('welcome', { onConfirm: advance });
        },
        (advance) => {
            const note = Notes.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
            const handle = document.querySelector('.block-dropdown .handle');
            note.attach('.block-dropdown .handle-area');
            // Attach listener to handle
            handle.addEventListener('click', () => {
                note.close();
                advance();
            }, {once: true});
        },
    ]
}