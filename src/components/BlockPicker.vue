<script>
import BlockType from '@/services/BlockType'
import BlockSlot from './BlockSlot'

export default {
    name: 'BlockPicker',
    
    render(create) {
        // Create a div with one block for each block type as children
        return create(
            'div',
            {
                class: 'block-picker',
            },
            BlockType.values.map((type) => create(BlockSlot, {
                props: {
                    mode: 'bucket',
                    holdingInitial: type
                }
            }))
        )
    }
}
</script>