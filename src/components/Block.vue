<template>
    <div
        class="game-block-shape game-block"
        :style="{ 'background-color': this.$config.getBlockTypeColor(this.type),
            display: 'flex', 'align-items': 'center', 'justify-content': 'space-around', padding: '0.5em' }">
        <img v-for="(stress, index) in this.type.stresses" :src="stress.icon" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { BlockType } from '@/services/Constants'

export default {
    name: 'Block',

    props: {
        type: BlockType
    },

}
</script>