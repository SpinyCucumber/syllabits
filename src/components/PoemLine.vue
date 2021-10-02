<template>
    <div :class="classes">
        <!-- Line number -->
        <!-- Add 1 because programmers are weird -->
        <div class="number">{{ line.number + 1 }}</div>

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
                    @click="onCheck"
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
// TODO Disable moving blocks while in checking state
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

export default {

    name: 'PoemLine',
    components: { BlockSlot, Feedback },

    props: {
        line: { required: true },
        lineProgressProxy: { required: true },
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
            };
            this.$emit('update:lineProgressProxy', progress);
            return progress;
        },
        // CSS classes
        classes() {
            let classes = ['line'];
            classes.push(CLASS_LOOKUP.get(this.lineProgress.state));
            if (this.line.stanzaBreak) classes.push('stanza-break');
            return classes;
        },
        // Whether the check button is visible
        canCheck() {
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
        onCheck() {
            // Transition state to "checking"
            this.lineProgress.state = LineState.Checking;
            // Emit event for component user to handle
            this.$emit('check', this.lineProgress.holding, this.handleCheck);
        },

        handleCheck(result) {
            // Send animation message to incorrect slots
            for (let i of result.hintIndicies) {
                this.$refs.slots[i].animate('incorrect');
            }
            // Transition state
            this.lineProgress.state = result.correct ?
                LineState.Correct : LineState.Incorrect;
            // Could abstract this using events
            if (result.correct) {
                this.$refs.feedback.show(FeedbackType.Perfect);
                this.animateCorrect();
            }
        },

        // Correct animation
        animateCorrect() {
            let delay = 0;
            for(let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.$refs.slots[i].animate('correct');
                }, delay);
                delay += 100;
            }
        },

    },

    watch: {
        holding() {
            // If the slots are modified while the line is incorrect, transition to unchecked
            this.lineProgress.state = LineState.Unchecked;
        }
    },

}
</script>