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
                class: 'block',
                style: {
                    color: this.type.color,
                }
            }
        )
    }

}
</script>