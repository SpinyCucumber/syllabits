<template>
    <div :class="classes">
        <!-- Line number -->
        <!-- Add 1 because computers are weird -->
        <div v-if="hasNumber" class="number">{{ line.number + 1 }}</div>

        <div class="text-box">
            <!-- Block slots -->
            <div class="slot-container">
                <block-slot v-for="n in 5"
                    ref="slots"
                    :key="n"
                    :holding.sync="lineProgress.holding[n-1]"
                    :mode="slotMode"/>
            </div>
            <!-- Line text -->
            <div class="text">{{ line.text }}</div>
        </div>

        <!-- Feedback area -->
        <!-- Feedback area is a fixed size to accomodate variable-sized contents -->
        <div class="feedback-area">
            <transition name="fade">
                <b-button type="is-dark"
                    @click="check"
                    class="check-button"
                    v-if="canCheck">
                    {{ $translation.get("play.check") }}
                </b-button>
            </transition>
            <feedback ref="feedback"/>
        </div>

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
import Feedback from './Feedback'
import { Constants } from '@/services'

const { LineState, SlotMode, FeedbackType } = Constants;

const CLASS_LOOKUP = new Map([
    [LineState.Unchecked, 'unchecked'],
    [LineState.Checking, 'checking'],
    [LineState.Correct, 'correct'],
    [LineState.Incorrect, 'incorrect'],    
]);

// Maps number of attempts to different feedback types.
// For example, one attempt => perfect, two attempts => great, etc.
// Four attempts and higher default to "okay"
const FEEDBACK_LEVELS = [FeedbackType.Perfect, FeedbackType.Great, FeedbackType.Good];

function getFeedbackLevel(attempts) {
    return FEEDBACK_LEVELS[attempts - 1] || FeedbackType.Okay;
}

export default {

    name: 'PoemLine',
    components: { BlockSlot, Feedback },

    props: {
        line: { required: true },
        lineProgressProxy: { required: true },
        checkHandler: { required: true, type: Function },
        hasNumber: { default: false },
        automaticFeedback: { default: false },
    },

    computed: {
        // An alias for the slot values of the line progress.
        // This allows us to watch the slots for changes.
        holding() {
            return this.lineProgress.holding;
        },
        // Whether every slot contains a block type
        isValidSequence() {
            return !this.lineProgress.holding.some(blockType => blockType === null);
        },
        // Create an alias for lineProgress.state so we can watch it
        state() {
            return this.lineProgress.state;
        },
        // This allows us to implement line progress in a "lazy" way.
        // If the poem isn't tracking progress for this line yet, we tell it to.
        // Part of why this works is that computed properties are not recomputed until
        // the dependent properties change.
        // We could encapsulate this pattern in a directive
        lineProgress() {
            if (this.lineProgressProxy) return this.lineProgressProxy;
            let progress = {
                state: LineState.Unchecked,
                holding: new Array(5).fill(null),
                attempts: 0,
            };
            this.$emit('update:lineProgressProxy', progress);
            return progress;
        },
        // CSS classes
        classes() {
            let classes = ['line'];
            classes.push(CLASS_LOOKUP.get(this.lineProgress.state));
            return classes;
        },
        // Whether the check button is visible
        canCheck() {
            if (this.automaticFeedback) return false;
            if (this.lineProgress.state === LineState.Unchecked) {
                return this.isValidSequence;
            }
            return false;
        },
        // How the slots should behave
        slotMode() {
            if (this.lineProgress.state === LineState.Correct) return SlotMode.Locked;
            return SlotMode.Slot;
        },
    },

    methods: {

        /**
         * Should only be called when the line is in the Unchecked state; transitions to Checking.
         */
        check() {
            // Transition state to "checking"
            this.lineProgress.state = LineState.Checking;
            // Increment attempts
            this.lineProgress.attempts += 1;
            // Let component user handle check
            this.checkHandler(this.lineProgress.holding)
                .then(result => {
                    // Transition state
                    this.lineProgress.state = result.correct ?
                        LineState.Correct : LineState.Incorrect;
                    // Trigger animations
                    // Animations are only triggered when we actually get a check result back.
                    // This is because we need the feedback to actually perform the incorrect
                    // animations.
                    if (result.correct) this.animateCorrect();
                    else this.animateIncorrect(result.hintIndicies);
                });
        },

        // Correct animation
        animateCorrect() {
            // 'Bounce' the slots in order to create a wave
            let delay = 0;
            for(let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.$refs.slots[i].animate('correct');
                }, delay);
                delay += 100;
            }
            // Feedback!
            // Retrieve feedback level using attempts
            const feedbackLevel = getFeedbackLevel(this.lineProgress.attempts);
            setTimeout(() => {
                this.$refs.feedback.show(feedbackLevel);
            }, delay);
        },

        animateIncorrect(hintIndicies) {
            // Send animation message to incorrect slots
            for (let i of hintIndicies) {
                this.$refs.slots[i].animate('incorrect');
            }
            setTimeout(() => {
                this.$refs.feedback.show(FeedbackType.Incorrect);
            }, 500);
        }

    },

    watch: {
        holding() {
            // If the slots are modified while the line is incorrect, transition to unchecked
            this.lineProgress.state = LineState.Unchecked;
        },
        state(newState) {
            if (newState === LineState.Correct) this.$emit('correct');
            else if (newState === LineState.Incorrect) this.$emit('incorrect');
        },
        isValidSequence(newVal) {
            // If the player completes the line while automatic feedback is enabled,
            // we automatically check the answer
            if (newVal) this.check();
        }
    },

}
</script>