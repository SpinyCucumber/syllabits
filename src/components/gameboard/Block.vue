<template>
    <div
        :class="['game-block', `is-type-${blockType.name.toLowerCase()}`]">
        <img v-for="(stress, index) in blockType.stresses" :src="$assets.getIcon(stress.name.toLowerCase())" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { Constants } from '@/services'
const { BlockType } = Constants;

export default {
    name: 'Block',
    props: {
        type: String,
    },
    computed: {
        blockType() {
            return BlockType.fromValue(this.type);
        }
    },
}
</script>