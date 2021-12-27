<template>
    <div
        :class="['game-block', `type-${type.name}`]">
        <img v-for="(stress, index) in this.type.stresses" :src="$assets.getIcon(stress.name)" :key="index" class="game-notation"/>
    </div>
</template>

<script>
import { Constants } from '@/services'
const { BlockTypes } = Constants;

export default {
    name: 'Block',
    props: {
        typeCode: String,
    },
    computed: {
        type() {
            return BlockTypes.forCode(this.typeCode);
        }
    },
}
</script>