<template>
    <div class="line">
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
import BlockSlot from './BlockSlot'
import { Constants } from '@/services'
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
        // We could encapsulate this pattern in a directive
        lineProgress() {
            if (this.lineProgressProxy) return this.lineProgressProxy;
            let progress = {
                state: Constants.LineState.Unchecked,
                holding: new Array(5).fill(null),
            };
            this.$emit('update:lineProgressProxy', progress);
            return progress;
        },
    },
    methods: {
        /**
         * Should only be called when the line is in the Unchecked state; transitions to Checking.
         */
        checkLine() {
            // Create a code using the block types the line contains.
            // This is for representing the sequence of blocks efficiently.
            const code = Constants.BlockTypes.serializeSequence(this.lineProgress.holding);
            // TODO Change state
            // We have to construct the input
            const input = { poemID: this.$parent.id, lineNum: this.line.number, answer: code }
            this.$apollo.mutate({ mutation: checkLineQuery, variables: { input } })
                .then(result => result.data.checkLine)
                .then(result => {
                    // Send animation message to incorrect slots
                    for (let i of result.hintIndicies) {
                        this.$refs.slots[i].animate('incorrect');
                    }
                    // TODO Transition state
                });
        }
    },
}
</script>