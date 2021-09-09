<script>
import BlockType from '@/services/BlockType'
import { Draggable } from 'vue-dndrop';

export default {
    name: 'Block',

    props: {
        type: BlockType
    },

    render(create) {
        // Create block element
        return create(
            Draggable,
            {},
            [create(
                'div',
                {
                    class: 'syllabits-block-shape syllabits-block',
                    attrs: { key: this.type.name, },
                    style: {
                        'background-color': this.type.color,
                    }
                },
                this.type.notation
            )]
        )
    }

}
</script>