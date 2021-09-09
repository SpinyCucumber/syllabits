<script>
import { Container } from 'vue-dndrop'
import BlockType from '@/services/BlockType'
import Block from './Block'

export default {
    name: 'BlockPicker',
    
    render(create) {
        // Create a div with one block for each block type as children
        return create(
            Container,
            {
                class: 'syllabits-block-picker',
                props: {
                    behaviour: 'copy',
                }
            },
            BlockType.values.map((type) => create(Block, {
                props: {
                    type: type
                }
            }))
        )
    }
}
</script>