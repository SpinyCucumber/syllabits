import { Translation, Notes } from '@/services'
import { DialogProgrammatic } from 'buefy'

function showDialog(key, options = {}) {
    DialogProgrammatic.alert({
        ...Translation.get('dialog.tutorial.' + key),
        ...Translation.get('dialog.tutorial.all'),
        ...options
    });
}

export default {
    /**
     * The tutorial contains a list of steps.
     * Each step is an object, which at minimum specifies a 'start' method.
     * This method should contain logic for setting up the step, including
     * displaying dialogs, hooking up event listeners, etc.
     * The start method can receive the following arguments:
     * 'advance', which is a function that advances the tutorial to the next step
     * 'vm', which refers to the gameboard instance
     * 'store', which is an object intended to store values that persist between steps
     * Each step can optionally specify a 'help' property, which is a translation key
     * that is used to show a help message to the user.
     */
    steps: [
        {
            start({advance, vm, store}) {
                const incorrectCallback = () => {
                    if (!store.hasMissedLine) {
                        showDialog('missedline');
                        store.hasMissedLine = true;
                    }
                }
                // Set up tutorial, which involves attaching incorrect
                // handler to each line. The first time the player gets a line
                // incorrect, we show a dialog explaining the mechanics.
                for (const line of vm.$refs.lines) {
                    line.$on('incorrect', incorrectCallback);
                }
                showDialog('welcome', { onConfirm: advance });
                // Disable all lines except for first
                for (let { id } of vm.sortedLines.slice(1)) {
                    vm.setLineOption(id, 'disabled', true);
                }
            },
        },
        {
            start({advance}) {
                const note = Notes.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
                const handle = document.querySelector('.block-dropdown .handle');
                note.attach('.block-dropdown .handle-area');
                // Attach listener to handle
                handle.addEventListener('click', () => {
                    note.close();
                    setTimeout(advance, 1000);
                }, {once: true});
            },
        },
        {
            start({advance, vm}) {
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
        },
        {
            help: 'dropblock',
            start({advance, vm}) {
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
        },
        {
            start({advance}) {
                showDialog('firstblock', { onConfirm: advance });
            },
        },
        {
            help: 'firstline',
            start({advance, vm}) {
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
        },
        {
            start({advance}) {
                showDialog('firstline', { onConfirm: advance });
            }
        },
        {
            start({advance, vm}) {
                // Re-enable all lines
                for (let { id } of vm.sortedLines) {
                    vm.deleteLineOption(id, 'disabled');
                }
                advance();
            }
        }
    ]
}