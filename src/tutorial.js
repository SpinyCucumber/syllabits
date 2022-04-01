import { Translation, Hints } from '@/services'
import { DialogProgrammatic as Dialog } from 'buefy'

/**
 * The tutorial contains a list of steps.
 * Each step is an object, which at minimum specifies a 'start' method.
 * This method should contain logic for setting up the step, including
 * displaying dialogs, hooking up event listeners, etc.
 * The start method can receive the following arguments:
 * 'advance', which is a function that advances the tutorial to the next step
 * 'vm', which refers to the Gameboard instance
 * Each step can optionally specify a 'help' property, which is a translation key
 * that is used to show a help message to the user.
 * The tutorial also specifies a 'setup' method, which should return an object
 * whose values are bound to the 'tutorial instance,' which is accessible through 'this'
 * in each start method.
 * The 'setup' method can also receive the 'vm' argument.
 */
export default {
    setup({ vm }) {
        const incorrectCallback = () => {
            setTimeout(() => {  
                Dialog.alert({ ...Translation.get('dialog.tutorial.missedline') });
            }, 2000);
        }
        // Set up tutorial, which involves attaching incorrect
        // handler to each line. The first time the player gets a line
        // incorrect, we show a dialog explaining the mechanics.
        vm.$once('lineIncorrect', incorrectCallback);
        // Disable all lines except for first
        for (let { id } of vm.sortedLines.slice(1)) {
            vm.setLineOption(id, 'disabled', true);
        }
        // Hide capture button (until last step!) and store reference to button
        const captureButton = vm.buttons.find((button) => button.key === 'capture');
        captureButton.shouldShow = () => false;
        return { captureButton };
    },
    steps: [
        {
            start({ advance }) {
                Dialog.alert({ ...Translation.get('dialog.tutorial.welcome'), onConfirm: advance });
            },
        },
        {
            start({ advance, vm }) {
                const note = Hints.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
                const handle = document.querySelector('.block-dropdown .handle');
                note.attach('.block-dropdown .handle-area');
                // Attach listener to handle
                handle.addEventListener('click', () => {
                    vm.sounds.stepComplete();
                    note.close();
                    setTimeout(advance, 1000);
                }, {once: true});
            },
        },
        {
            start({ advance, vm }) {
                const note = Hints.create({ message: Translation.get('message.tutorial.dragblock'), position: 'is-right' });
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
            start({ advance, vm }) {
                const note = Hints.create({ message: Translation.get('message.tutorial.dropblock'), position: 'is-top'});
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
            start({ advance, vm }) {
                vm.sounds.stepComplete();
                Dialog.alert({ ...Translation.get('dialog.tutorial.firstblock'), onConfirm: advance });
            },
        },
        {
            help: 'firstline',
            start({ advance, vm }) {
                const line = vm.$refs.lines[0];
                const checkButton = line.$refs.checkButton;
                // Attach note to check button
                const note = Hints.create({ message: Translation.get('message.tutorial.check'), position: 'is-top'});
                note.attach(checkButton.$el);
                line.$once('correct', () => {
                    setTimeout(() => {
                        note.close();
                        advance();
                    }, 2000);
                })
            },
        },
        {
            start({ advance, vm }) {
                vm.sounds.stepComplete();
                Dialog.alert({ ...Translation.get('dialog.tutorial.firstline'), onConfirm: advance, });
            }
        },
        {
            help: 'firststanza',
            start({ advance, vm }) {
                // Re-enable all lines
                for (let { id } of vm.poem.lines) {
                    vm.deleteLineOption(id, 'disabled');
                }
                // Wait for poem completion
                vm.$once('complete', () => {
                    setTimeout(advance, 3000);
                });
            }
        },
        {
            start({ advance }) {
                Dialog.alert({ ...Translation.get('dialog.tutorial.otherfeatures'), onConfirm: advance, });
            },
        },
        {
            start({ advance, vm }) {
                // Show capture button
                this.captureButton.shouldShow = () => true;
                // Attach note to capture button
                const captureButtonEl = vm.$refs.buttons.find((button) => button.key === 'capture');
                const note = Hints.create({ message: Translation.get('message.tutorial.capture'), position: 'is-bottom'});
                note.attach(captureButtonEl);
                // Wait for successful capture
                vm.$once('captureSuccess', () => {
                    note.close();
                    advance();
                })
            },
        },
        {
            start({ vm }) {
                vm.sounds.stepComplete();
                Dialog.confirm({
                    ...Translation.get('dialog.tutorial.complete'),
                    onConfirm: () => vm.$router.push({ name: 'RandomPoem' }),
                });           
            }
        }
    ]
}