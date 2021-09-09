<script>
import BlockType from '@/services/BlockType'

export default {
    name: 'Block',

    props: {
        type: BlockType
    },

    methods: {
        onDragStart(event) {
            event.dataTransfer.dropEffect = 'move';
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('blockTypeId', this.type.name);
        }
    },

    render(create) {
        // Create block element
        return create(
            'div',
            {
                class: 'syllabits-block-shape syllabits-block',
                attrs: { key: this.type.name, draggable: true, },
                style: {
                    'background-color': this.type.color,
                },
                on: {
                    dragstart: this.onDragStart,
                }
            },
            this.type.notation
        )
    }

}
</script>