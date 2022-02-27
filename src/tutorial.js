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
        function(advance) {
            showDialog('welcome', { onConfirm: advance });
        },
        function(advance) {
            const note = Notes.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
            const handle = this.$refs.blockDropdown.$refs.handle;
            note.attach('.block-dropdown .handle-area');
            handle.$on('click', function() {
                note.close();
                advance();
            });
        },
    ]
}