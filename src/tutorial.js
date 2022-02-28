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
                setTimeout(advance, 1000);
            }, {once: true});
        },
        (advance) => {
            const note = Notes.create({ message: Translation.get('message.tutorial.dragblock'), position: 'is-right'});
            const slot = document.querySelector('.block-dropdown .game-slot.is-holding-iamb');
            note.attach(slot);
            // Find slot and attach event listener
            slot.addEventListener('mousedown', () => {
                note.close();
                setTimeout(advance, 1000);
            }, {once: true});
        }
    ]
}