<script>
import BlockType from '@/services/BlockType'

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
                class: 'syllabits-block',
                style: {
                    'background-color': this.type.color,
                }
            },
            this.type.notation
        )
    }

}
</script>