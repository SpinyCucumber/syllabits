<template>
    <div
        :class="['game-block', `is-type-${blockType.name}`]">
        <img v-for="(stress, index) in blockType.stresses" :src="$assets.getIcon(stress.name)" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { Constants } from '@/services'
const { BlockTypes } = Constants;

export default {
    name: 'Block',
    props: {
        type: String,
    },
    computed: {
        blockType() {
            return BlockTypes.forCode(this.type);
        }
    },
}
</script>