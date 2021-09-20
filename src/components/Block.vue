<template>
    <div
        class="game-block-shape game-block"
        :style="{ 'background-color': this.type.color,
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

    render(create) {
        // Create block element
        return create(
            'div',
            {
                class: 'game-block',
                style: {
                    'background-color': this.type.color,
                },
            },
            this.type.notation
        )
    }

}
</script>