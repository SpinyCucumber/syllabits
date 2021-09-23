<template>
    <div class="line">
        <!-- Line number -->
        <!-- Add 1 because programmers are weird -->
        <div class="number">{{ line.number + 1 }}</div>

        <div class="text-box">
            <!-- Block slots -->
            <div class="slot-container">
                <block-slot v-for="n in 5" :key="n" :holding.sync="holdingList[n-1]"/>
            </div>
            <!-- Line text -->
            <div class="text">{{ line.text }}</div>
        </div>

        <!-- Feedback -->
        <div :class="{ feedback: true, visible: isValidSequence }">
            <b-button label="Check!" type="is-dark" class="check-button"/>
        </div>

    </div>
</template>

<script>
import BlockSlot from './BlockSlot'

const State = {
    Unchecked: 'Unchecked',
    Checking: 'Checking',
    Correct: 'Correct',
    Incorrect: 'Incorrect',
}

export default {
    name: 'PoemLine',
    components: { BlockSlot },
    props: { 
        line: { required: true },
    },
    data() {
        return {
            holdingList: new Array(5).fill(null),
            state: State.Unchecked,
        }
    },
    computed: {
        isValidSequence() {
            return !this.holdingList.some(holding => holding === null);
        }
    }
}
</script>