<template>
    <div class="line">
        <!-- Line number -->
        <!-- Add 1 because programmers are weird -->
        <div class="number">{{ line.number + 1 }}</div>

        <div class="text-box">
            <!-- Block slots -->
            <div class="slot-container">
                <block-slot v-for="n in 5" ref="slots" :key="n" :holding.sync="holdingList[n-1]"/>
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
        lineState: { required: true },
    },
    computed: {
        isValidSequence() {
            return !this.holdingList.some(holding => holding === null);
        }
    },
    methods: {
        /**
         * Should only be called when the line is in the Unchecked state; transitions to Checking.
         */
        checkLine() {
            // Create a code using the block types the line contains.
            // This is for representing the sequence of blocks efficiently.
            const code = Constants.BlockTypes.serializeSequence(this.lineState.holdingList);
            // Change line state and send a request to the server
            this.state = State.Checking;
            // We have to construct the input
            const input = { poemID: this.$parent.id, lineNum: this.line.number, answer: code }
            this.$apollo.mutate({ mutation: checkLineQuery, variables: { input } })
                .then(result => result.data.checkLine)
                .then(result => {
                    // TODO Transition state
                    // DEBUG
                    console.log(result);
                    // Send animation message to incorrect slots
                    for (let i of result.hintIndicies) {
                        this.$refs.slots[i].animate('incorrect');
                    }
                });
        }
    }
}
</script>