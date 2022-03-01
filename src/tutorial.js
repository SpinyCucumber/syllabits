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
        (advance, vm) => {
            const note = Notes.create({ message: Translation.get('message.tutorial.dragblock'), position: 'is-right'});
            // Find Iamb slot
            const picker = vm.$refs.blockDropdown.$slots.default[0].componentInstance;
            const slot = picker.$refs.buckets.find(bucket => (bucket.holding === 'i'));
            // Attach listener and note
            note.attach(slot.$el);
            slot.$once('move', () => {
                setTimeout(() => {
                    note.close();
                    advance();
                }, 500);
            });
        },
        (advance, vm) => {
            const note = Notes.create({ message: Translation.get('message.tutorial.dropblock'), position: 'is-top'});
            const slot = vm.$refs.lines[0].$refs.slots[0];
            // Attach note and listener
            note.attach(slot.$el);
            const callback = (value) => {
                if (value === 'i') {
                    slot.$off('accept', callback);
                    setTimeout(() => {
                        note.close();
                        advance();
                    }, 500);
                }
            }
            slot.$on('accept', callback);
        },
        (advance) => {
            showDialog('firstblock', { onConfirm: advance });
        },
        (advance, vm) => {
            const line = vm.$refs.lines[0];
            const checkButton = line.$refs.checkButton;
            // Attach note to check button
            const note = Notes.create({ message: Translation.get('message.tutorial.check'), position: 'is-top'});
            note.attach(checkButton.$el);
            line.$once('correct', () => {
                note.close();
                advance();
            })
        },
        (advance) => {
            showDialog('firstline', { onConfirm: advance });
        },
    ]
}