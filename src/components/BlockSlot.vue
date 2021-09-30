<template>
    <div :class="classes" @animationend="onAnimationEnd">

        <container
            :should-accept-drop="shouldAcceptDrop"
            :get-child-payload="getPayload"
            :remove-on-drop-out="removeOnDrop"
            drag-class="ghost"
            drop-class="ghost-drop"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
            @drag-enter="onDragEnter"
            @drag-leave="onDragLeave"
            @drop="onDrop"
            style="position: absolute; width: 100%; height: 100%;">
            <draggable v-if="holding">
                <block :type="holding"/>
            </draggable>
        </container>

        <svg
            class="game-block-shape">
            <rect
                x = "2" y="2"
                width="81" height="46"
                rx = "8" ry = "8"
                class = "game-blank">
            </rect>
        </svg>

    </div>
</template>

<script>
import Block from './Block'
import { BlockType } from '@/models'
import { Draggable, Container } from 'vue-smooth-dnd'
import useSound from 'vue-use-sound'
import { Constants, AssetService } from '@/services'

const { SlotMode } = Constants;

const CLASS_LOOKUP = new Map([
    [SlotMode.Slot, 'slot'],
    [SlotMode.Bucket, 'bucket'],
    [SlotMode.Locked, 'locked'],
])

export default {
    name: 'BlockSlot',
    components: { Block, Draggable, Container },

    props: {
        mode: { default: SlotMode.Slot },
        holding: BlockType, 
    },

    data() {
        return {
            dragActive: false,
            dropActive: false,
            currentAnimation: null,
        }
    },

    setup() {
        // Load sounds
        const [playDrop] = useSound(AssetService.getSound('BlockDrop'));
        return {
            playDrop
        };
    },

    methods: {

        shouldAcceptDrop(srcOptions, payload) {
            // If the slot if locked, only accept drops from ourself
            if (payload.source.mode === SlotMode.Locked) {
                return this === payload.source;
            }
            if (this.mode === SlotMode.Slot) return true;
            return false;
        },

        onDragStart(dragResult) {
            if (dragResult.isSource) this.dragActive = true;
        },

        onDragEnd(dragResult) {
            if (dragResult.isSource) this.dragActive = false;
        },

        onDragEnter() {
            this.dropActive = true;
        },

        onDragLeave() {
            this.dropActive = false;
        },

        onDrop(dropResult) {
            const { removedIndex, addedIndex, payload } = dropResult;
            if (addedIndex === removedIndex) {
                // If we are dropping into ourselves, we don't need to trigger any update
            }
            // Only clear slot if we are in "slot" mode
            else if (removedIndex != null) {
                if (this.mode === SlotMode.Slot) this.$emit('update:holding', null);
            }
            else {
                this.$emit('update:holding', payload.source.holding);
                // Play sound
                console.log(this.BlockDrop);
                this.playDrop();
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
            this.currentAnimation = animation;
        }

    },

    computed: {
        classes() {
            let classes = ['game-slot'];
            if (this.currentAnimation) classes.push(`${this.currentAnimation}-active`);
            if (this.dropActive) classes.push('drop-active');
            if (this.dragActive) classes.push('drag-active');
            // Push mode class
            classes.push(CLASS_LOOKUP.get(this.mode));
            return classes;
        },
        removeOnDrop() {
            if (this.mode === SlotMode.Slot) return true;
            // Can add behavior for other modes here
            return false;
        }
    }

}
</script>