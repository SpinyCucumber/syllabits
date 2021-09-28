<template>
    <div style="position: relative;" :class="classes" @animationend="onAnimationEnd">

        <container
            :should-accept-drop="shouldAcceptDrop"
            :get-child-payload="getPayload"
            :remove-on-drop-out="removeOnDrop"
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
        // Valid modes are 'slot', 'bucket', or 'locked'
        mode: { type: String, default: 'slot' },
        holding: BlockType,
    },

    data() {
        return {
            dropActive: false,
            currentAnimation: null,
        }
    },

    methods: {
        shouldAcceptDrop(srcOptions, payload) {
            // If the slot if locked, only accept drops from ourself
            if (payload.source.mode === 'locked') {
                return this === payload.source;
            }
            if (this.mode === 'slot') return true;
            return false;
        },
        onDragEnter() {
            if (this.mode === 'slot') this.dropActive = true;
        },
        onDragLeave() {
            if (this.mode === 'slot') this.dropActive = false;
        },
        onDrop(dropResult) {
            const { removedIndex, addedIndex, payload } = dropResult;
            if (addedIndex === removedIndex) {
                // If we are dropping into ourselves, we don't need to trigger any update
            }
            // Only clear slot if we are in "slot" mode
            else if (removedIndex != null) {
                if (this.mode === 'slot') this.$emit('update:holding', null);
            }
            else {
                this.$emit('update:holding', payload.source.holding);
            }
            // If we are the container being dropped into
            if (addedIndex != null) {
                this.dropActive = false;
            }
        },
        getPayload() {
            return { source: this }
        },
        onAnimationEnd() {
            this.currentAnimation = null;
        },
        // TODO Could abstract as mixin
        animate(animation) {
            // DEBUG
            console.log('Adding animation', animation);
            this.currentAnimation = animation;
        }
    },

    computed: {
        classes() {
            let classes = ['game-slot-container'];
            if (this.currentAnimation) classes.push(`${this.currentAnimation}-active`);
            return classes;
        },
        removeOnDrop() {
            if (this.mode === 'locked') return false;
            // Can add behavior for other modes here
            return true;
        }
    }

}
</script>