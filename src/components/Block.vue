<template>
    <div
        :class="['game-block', `type-${type.name}`]">
        <img v-for="(stress, index) in this.type.stresses" :src="$assets.getIcon(stress.name)" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { BlockType } from '@/utilities'

export default {
    name: 'Block',

    props: {
        type: BlockType
    },

}
</script>