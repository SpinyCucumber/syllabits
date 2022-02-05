<template>
    <div :class="classes">
        <!-- Line number -->
        <!-- Add 1 because computers are weird -->
        <div v-if="hasNumber" class="number">{{ line.order + 1 }}</div>

        <div class="text-box">
            <!-- Block slots -->
            <div class="slot-container">
                <block-slot v-for="n in holding.length"
                    ref="slots"
                    :key="n"
                    :holding.sync="holding[n-1]"
                    :mode="slotMode"
                    v-on="slotListeners"/>
            </div>
            <!-- Line text -->
            <editable v-model="line.text"
                class="poem-text"
                control-type="input-resizable"
                :control-options="{
                    size: 'is-large',
                    placeholder: $translation.get('placeholder.poem.text')
                }"
                v-slot="{value}">
                {{ value }}
            </editable>
        </div>

        <!-- Feedback area -->
        <!-- Feedback area is a fixed size to accomodate variable-sized contents -->
        <div v-if="mode === 'play'" class="feedback-area">
            <transition name="fade">
                <b-button type="is-dark"
                    @click="check"
                    class="check-button"
                    v-if="canCheck">
                    {{ $translation.get('play.check') }}
                </b-button>
            </transition>
            <feedback ref="feedback"/>
        </div>
        <!-- Action dropdown for edit mode -->
        <b-dropdown v-else-if="mode === 'edit'" class="actions">
            <template #trigger>
                <b-button class="borderless has-text-grey" icon-left="dots-horizontal" size="is-medium"/>
            </template>
            <b-dropdown-item v-for="action in actions"
                :key="action.key"
                v-bind="action.options"
                @click="action.apply(line)">
                <b-icon :icon="action.icon" size="is-small"/>
                {{ $translation.get('button.line.' + action.key) }}
            </b-dropdown-item>
        </b-dropdown>

    </div>
</template>

<script>
// Poem Line State
// 1. Unchecked
//  Starts in unchecked state. Can transition back to unchecked if slots are changed while incorrect.
// 2. Checking (i.e. while querying server)
//  Can enter checking while unchecked and all slots are filled. Transitions to either correct or incorrect.
// 3. Correct
//  Can transition back to Unchecked only be resetting poem progress.
// 4. Incorrect
//  Can transition to Unchecked by changing slots.
import BlockSlot from './BlockSlot'
import Editable from './Editable'
import Feedback from './Feedback'
import { Constants } from '@/services'

const { LineState, SlotMode, FeedbackType } = Constants;

// Maps number of attempts to different feedback types.
// For example, one attempt => perfect, two attempts => great, etc.
// Four attempts and higher default to "okay"
const FEEDBACK_LEVELS = [FeedbackType.Perfect, FeedbackType.Great, FeedbackType.Good];

function getFeedbackLevel(attempts) {
    return FEEDBACK_LEVELS[attempts - 1] || FeedbackType.Okay;
}

export default {

    name: 'PoemLine',
    components: { BlockSlot, Feedback, Editable },

    props: {
        mode: { default: 'play' },
        line: { required: true },
        progress: { type: Object }, // Used in play mode to track user answer
        checkHandler: { type: Function }, // Defines how answers should be checked in play mode
        // A list of dropdown edit actions to show in edit mode
        // Each action must define a string 'key', and a function 'apply' which accepts a line
        // Can also optionally specify an 'options' prop which is bound to the dropdown item
        actions: { type: Array },
        hasNumber: { default: true }, // Whether the line number is shown
        automaticFeedback: { default: false }, // If false, the user has to manually press a "check" button
    },

    computed: {
        // Whether every slot contains a block
        full() {
            return !this.holding.some(blockType => blockType === '');
        },
        // The blocks the line currently contains
        holding() {
            // In edit mode, the slots are bound to the line key
            if (this.mode === 'edit') return this.line.key;
            if (this.mode === 'play') return this.progress.holding;
            return null;
        },
        // CSS classes
        classes() {
            let classes = ['poem-line'];
            classes.push(`is-mode-${this.mode}`);
            // If line is in play mode, attach additional info
            if(this.mode === 'play') classes.push(`is-state-${this.progress.state.name}`);
            if (this.line.stanzaBreak) classes.push('has-stanza-break');
            return classes;
        },
        // Whether the check button is visible
        canCheck() {
            if (this.automaticFeedback) return false;
            if (this.progress.state === LineState.Unchecked) {
                return this.full;
            }
            return false;
        },
        // What slot events we listen to
        slotListeners() {
            // In play mode, we listen to slot changes to transition to unchecked if necessary
            let listeners = {}
            if (this.mode === 'play' && this.progress.state === LineState.Incorrect) {
                listeners = { ...listeners,
                    'update:holding': () => { this.progress.state = LineState.Unchecked }
                };
            }
            return listeners;
        },
        // How the slots should behave
        slotMode() {
            if (this.mode === 'edit') return SlotMode.Slot;
            else if (this.mode === 'play') {
                // Slots are locked if line is correct
                if (this.progress.state === LineState.Correct) return SlotMode.Locked;
                return SlotMode.Slot;
            }
            return null;
        },
    },

    methods: {

        /**
         * Should only be called when the line is in the Unchecked state; transitions to Checking.
         */
        check() {
            // Transition state to "checking"
            this.progress.state = LineState.Checking;
            // Increment attempts
            this.progress.attempts += 1;
            // Let component user handle check
            this.checkHandler(this.progress.holding)
                .then(result => {
                    // Transition state
                    this.progress.state = result.correct ?
                        LineState.Correct : LineState.Incorrect;
                    // Trigger animations
                    // Animations are only triggered when we actually get a check result back.
                    // This is because we need the feedback to actually perform the incorrect
                    // animations.
                    if (result.correct) this.handleCorrect();
                    else this.handleIncorrect(result.conflicts);
                });
        },

        handleCorrect() {
            this.$emit('correct');
            // 'Bounce' the slots in order to create a wave
            let delay = 0;
            for(let slot of this.$refs.slots) {
                setTimeout(() => slot.animate('correct'), delay);
                delay += 100;
            }
            // Feedback!
            // Retrieve feedback level using attempts
            const feedbackLevel = getFeedbackLevel(this.progress.attempts);
            setTimeout(() => {
                this.$refs.feedback.show(feedbackLevel);
            }, delay);
        },

        handleIncorrect(hintIndicies) {
            this.$emit('incorrect');
            let delay = 0;
            // If hints are enabled, send animation message to incorrect slots
            if (this.$store.state.settings.hints) {
                delay = 500;
                for (let i of hintIndicies) {
                    this.$refs.slots[i].animate('incorrect');
                }
            }
            setTimeout(() => {
                this.$refs.feedback.show(FeedbackType.Incorrect);
            }, delay);
        },

    },

    watch: {
        full(newVal) {
            // If the player completes the line while automatic feedback is enabled,
            // we automatically check the answer
            if (this.mode === 'play' && newVal && this.automaticFeedback) this.check();
        }
    },

}
</script>