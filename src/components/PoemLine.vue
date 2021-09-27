<template>
    <div :class="classes">
        <!-- Line number -->
        <!-- Add 1 because programmers are weird -->
        <div class="number">{{ line.number + 1 }}</div>

        <div class="text-box">
            <!-- Block slots -->
            <div class="slot-container">
                <block-slot v-for="n in 5" ref="slots" :key="n" :holding.sync="lineProgress.holding[n-1]"/>
            </div>
            <!-- Line text -->
            <div class="text">{{ line.text }}</div>
        </div>

        <!-- Feedback -->
        <b-button label="Check!" type="is-dark"
            @click="checkLine"
            :class="{ 'check-button': true, visible: isValidSequence }"/>

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
import checkLineQuery from '@/queries/checkLine.gql'

export default {
    name: 'PoemLine',
    components: { BlockSlot },
    props: { 
        line: { required: true },
        lineProgressProxy: { required: true },
    },
    computed: {
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
                state: this.$constants.LineState.Unchecked,
                holding: new Array(5).fill(null),
            };
            this.$emit('update:lineProgressProxy', progress);
            return progress;
        },
        // CSS classes
        classes() {
            return {
                line: true,
                correct: this.lineProgress.state === this.$constants.LineState.Correct,
                incorrect: this.lineProgress.state === this.$constants.LineState.Incorrect,
            }
        }
    },
    methods: {
        /**
         * Should only be called when the line is in the Unchecked state; transitions to Checking.
         */
        checkLine() {
            // Create a code using the block types the line contains.
            // This is for representing the sequence of blocks efficiently.
            const code = this.$constants.BlockTypes.serializeSequence(this.lineProgress.holding);
            // Transition state to "checking"
            this.lineProgress.state = this.$constants.LineState.Checking;
            // We have to construct the input
            const input = { poemID: this.$parent.id, lineNum: this.line.number, answer: code }
            this.$apollo.mutate({ mutation: checkLineQuery, variables: { input } })
                .then(result => result.data.checkLine)
                .then(output => {
                    // Send animation message to incorrect slots
                    for (let i of output.hintIndicies) {
                        this.$refs.slots[i].animate('incorrect');
                    }
                    // Transition state
                    this.lineProgress.state = output.correct ?
                        this.$constants.LineState.Correct : this.$constants.LineState.Incorrect;
                });
        }
    },
}
</script>