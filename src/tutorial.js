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
 * 'tutorial', which refers to the tutorial instance
 * (Most) steps should also specify the 'close' method, which should tear down all everything created in the
 * start method.
 * Each step can optionally specify a 'help' property, which is a translation key
 * that is used to show a help message to the user.
 * Steps can also specify 'created' and 'mounted' methods, which are hooks called by the Vue instance.
 * These methods are bound to the step instance, so they can be used to store references to elements and
 * perform other setup logic. The 'start' and 'close' methods are also bound to the step instance,
 * so they can access properties assigned to 'this' in the hooks.
 * The tutorial can also specify general 'created' and 'mounted' hooks, which function similarly to the hooks
 * for individual steps. These methods are bound to the tutorial instance, which is accessible in each step method
 * through the 'tutorial' argument.
 */
export default {
    created({ vm }) {
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
        this.captureButton = vm.buttons.find((button) => button.key === 'capture');
        this.captureButton.shouldShow = () => false;
    },
    steps: [
        {
            mounted() {
                this.note = Hints.create({ message: Translation.get('message.tutorial.openpalette'), position: 'is-right'});
                this.handle = document.querySelector('.block-dropdown .handle');
            },
            async start({ advance }) {
                await Dialog.alert(Translation.get('dialog.tutorial.welcome'));
                this.note.attach('.block-dropdown .handle-area');
                // Attach listener to handle
                this.callback = advance;
                this.handle.addEventListener('click', this.callback);
            },
            close({ vm }) {
                vm.sounds.stepComplete();
                this.handle.removeEventListener('click', this.callback);
                this.note.close();
            },
        },
        {
            mounted({ vm }) {
                this.note = Hints.create({ message: Translation.get('message.tutorial.dragblock'), position: 'is-right' });
                // Find Iamb slot
                let picker = vm.$refs.blockDropdown.$slots.default[0].componentInstance;
                this.slot = picker.$refs.buckets.find(bucket => (bucket.holding === 'i'));
            },
            start({ advance }) {
                // Attach listener and note
                this.note.attach(this.slot.$el);
                this.callback = advance;
                this.slot.$on('move', this.callback);
            },
            close() {
                this.slot.$off('move', this.callback);
                this.note.close();
            },
        },
        {
            help: 'dropblock',
            mounted({ vm }) {
                this.note = Hints.create({ message: Translation.get('message.tutorial.dropblock'), position: 'is-top'});
                this.slot = vm.$refs.lines[0].$refs.slots[0];
            },
            start({ advance }) {
                // Attach note and listener
                this.note.attach(this.slot.$el);
                this.callback = (value) => {
                    if (value === 'i') advance();
                }
                this.slot.$on('accept', this.callback);
            },
            close() {
                this.slot.$off('accept', this.callback);
                this.note.close();
            }
        },
        {
            help: 'firstline',
            mounted({ vm }) {
                this.line = vm.$refs.lines[0];
                this.checkButton = this.line.$refs.checkButton;
                this.note = Hints.create({ message: Translation.get('message.tutorial.check'), position: 'is-top'});
            },
            async start({ vm, advance }) {
                vm.sounds.stepComplete();
                await Dialog.alert(Translation.get('dialog.tutorial.firstblock'));
                this.note.attach(this.checkButton.$el);
                this.callback = advance;
                this.line.$on('correct', this.callback);
            },
            close() {
                this.note.close();
                this.line.$off('correct', this.callback);
            },
        },
        {
            help: 'firststanza',
            async start({ advance, vm }) {
                vm.sounds.stepComplete();
                await Dialog.alert(Translation.get('dialog.tutorial.firstline'));
                // Re-enable all lines
                for (let { id } of vm.poem.lines) {
                    vm.deleteLineOption(id, 'disabled');
                }
                // Wait for poem completion
                this.callback = advance;
                vm.$on('complete', this.callback);
            },
            close({ vm }) {
                vm.$off('complete', this.callback);
            },
        },
        {
            mounted() {
                this.note = Hints.create({ message: Translation.get('message.tutorial.capture'), position: 'is-bottom'});
            },
            async start({ advance, tutorial, vm }) {
                await Dialog.alert(Translation.get('dialog.tutorial.otherfeatures'));
                // Show capture button
                tutorial.captureButton.shouldShow = () => true;
                // Attach note to capture button
                await vm.$nextTick();
                const captureButtonEl = vm.$refs.buttons.find((button) => button.$vnode.key === 'capture').$el;
                this.note.attach(captureButtonEl);
                // Wait for successful capture
                this.callback = advance;
                vm.$on('captureSuccess', this.callback);
            },
            close({ vm }) {
                vm.$off('captureSuccess', this.callback);
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