<template>
    <div style="position: relative; width: 80px; height: 50px">

        <container
            :should-accept-drop="shouldAcceptDrop"
            :get-child-payload="getPayload"
            @drag-enter="onDragEnter"
            @drag-leave="onDragLeave"
            @drag-end="onDragEnd"
            @drop="onDrop"
            style="position: absolute; width: 100%; height: 100%;">
            <draggable v-if="holding">
                <block :type="holding"/>
            </draggable>
        </container>

        <svg
            style="width: 100%; height: 100%;">
            <rect
                x = "2" y="2"
                width="76" height="46"
                rx = "8" ry = "8"
                :drop-active = "String(dropActive)"
                class="syllabits-block-slot">
            </rect>
        </svg>

    </div>
</template>

<script>
import Block from './Block'
import { Draggable, Container } from 'vue-smooth-dnd'

export default {
    name: 'BlockSlot',
    components: { Block, Draggable, Container },
    props: { holdingInitial: null },

    created() {
        this.holding = this.holdingInitial;
    },

    data() {
        return {
            dropActive: false,
            dragActive: false,
            // The current block type we are holding
            holding: null,
        }
    },

    methods: {
        shouldAcceptDrop() {
            return !this.holding || this.dragActive;
        },
        onDragEnter() {
            this.dropActive = true;
        },
        onDragLeave() {
            this.dropActive = false;
        },
        onDrop(dropResult) {
            // If we are the source container
            if (dropResult.removedIndex != null) {
                this.holding = null;
            }
            // If we are the container being dropped into
            if (dropResult.addedIndex != null) {
                this.dropActive = false;
                this.holding = dropResult.payload;
            }
        },
        getPayload() {
            this.dragActive = true;
            return this.holding;
        },
        onDragEnd(event) {
            if (event.isSource) {
                this.dragActive = false;
            }
        },
    },

}
</script>