<template>
    <div>
        <block v-if="holding" :type="holding"/>
        <svg v-else
            width="80" height="50">
            <rect
                x = "2" y="2"
                width="76" height="46"
                rx = "8" ry = "8"
                class="syllabits-block-slot"
                :drop-active="dropActive"
                
                @drop="onDrop"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragOver">
            </rect>
        </svg>
    </div>
</template>

<script>
import Block from './Block'
import BlockType from '@/services/BlockType'

export default {
    name: 'BlockSlot',
    components: { Block },

    data() {
        return {
            dropActive: false,
            // The current block type we are holding
            holding: null,
        }
    },

    methods: {
        onDrop(event) {
            this.dropActive = false;
            // Set block type
            this.holding = BlockType[event.dataTransfer.getData('blockTypeId')];
            console.dir(event);
        },
        onDragOver(event) {
            event.preventDefault();
        },
        onDragEnter(event) {
            this.dropActive = true;
            event.preventDefault();
        },
        onDragLeave() {
            this.dropActive = false;
        }
    },

}
</script>