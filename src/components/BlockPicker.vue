<script>
import { Constants } from '@/services'
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
            Constants.BlockTypes.values.map((type) => create(BlockSlot, {
                props: {
                    mode: 'bucket',
                    holding: type
                }
            }))
        )
    }
}
</script>