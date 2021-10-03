<template>
    <div
        class="game-block"
        :style="{ 'background-color': this.$config.getBlockTypeColor(this.type) }">
        <img v-for="(stress, index) in this.type.stresses" :src="$assets.getIcon(stress.name)" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { BlockType } from '@/models'

export default {
    name: 'Block',

    props: {
        type: BlockType
    },

}
</script>