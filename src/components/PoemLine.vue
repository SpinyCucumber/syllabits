<template>
    <div style="display: flex; align-items: center; gap: 4em;">
        <!-- Line number -->
        <div class="line-number">{{ line.number }}</div>

        <div style="display: flex; flex-direction: column; gap: 0.5em;">
            <!-- Block slots -->
            <div style="display: flex; justify-content: space-between;">
                <block-slot v-for="n in 5" :key="n" :holding.sync="holdingList[n-1]"/>
            </div>
            <!-- Line text -->
            <div class="content">{{ line.text }}</div>
        </div>

        <!-- Feedback -->
        <div style="margin-left: auto;">
            <b-icon icon="check"/>
        </div>

    </div>
</template>

<script>
import BlockSlot from './BlockSlot'

export default {
    name: 'PoemLine',
    components: { BlockSlot },
    props: { 
        line: { required: true },
    },
    data() {
        return {
            holdingList: new Array(5).fill(null)
        }
    }
}
</script>