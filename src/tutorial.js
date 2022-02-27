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
        (advance, vm) => {
            const note = Notes.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
            const handle = vm.$refs.blockDropdown.$refs.handle;
            note.attach('.block-dropdown .handle-area');
            
            const originalListener = handle.$listeners['click'];
            handle.$listeners['click'] = function(event) {
                originalListener(event);
                console.log('hi');
            }
            handle.$forceUpdate();
        },
    ]
}