<template>
    <div style="position: relative;" class="game-block-shape">

        <container
            :should-accept-drop="shouldAcceptDrop"
            :get-child-payload="getPayload"
            :remove-on-drop-out="true"
            drag-class="ghost"
            drop-class="ghost-drop"
            @drag-enter="onDragEnter"
            @drag-leave="onDragLeave"
            @drop="onDrop"
            style="position: absolute; width: 100%; height: 100%;">
            <draggable v-if="holding">
                <block :type="holding" :class="{ 'drop-active': dropActive }"/>
            </draggable>
        </container>

        <svg
            class="game-block-shape">
            <rect
                x = "2" y="2"
                width="81" height="46"
                rx = "8" ry = "8"
                :class="{ 'game-slot': true, 'drop-active': dropActive }">
            </rect>
        </svg>

    </div>
</template>

<script>
import Block from './Block'
import { BlockType } from '@/models'
import { Draggable, Container } from 'vue-smooth-dnd'

export default {
    name: 'BlockSlot',
    components: { Block, Draggable, Container },

    props: {
        // Valid modes are 'slot' or 'bucket'
        mode: { type: String, default: 'slot' },
        holding: BlockType,
    },

    data() {
        return {
            dropActive: false,
        }
    },

    methods: {
        shouldAcceptDrop() {
            if (this.mode === 'slot') return true;
            else if (this.mode === 'bucket') return false;
            // Can add behavior for other modes here
            return false;
        },
        onDragEnter() {
            this.dropActive = true;
        },
        onDragLeave() {
            this.dropActive = false;
        },
        onDrop(dropResult) {
            // If we are the source container
            // Only clear slot if we are in "slot" mode
            if (dropResult.removedIndex != null) {
                if (this.mode === 'slot') this.$emit('update:holding', null);
            }
            // If we are the container being dropped into
            if (dropResult.addedIndex != null) {
                this.dropActive = false;
                this.$emit('update:holding', dropResult.payload);
            }
        },
        getPayload() {
            return this.holding;
        },
    },

}
</script>