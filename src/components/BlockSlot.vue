<template>
    <div :class="classes">

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
            <!-- NOTE In SVG 2 (not yet in FF) these properties can be specified in CSS, which would
                probably be better. Just waiting! -->
            <rect
                x = "2" y = "2"
                rx = "0.5em" ry = "0.5em"
                class = "game-blank">
            </rect>
        </svg>

    </div>
</template>

<script>
import Block from './Block'
import { Animatable } from '@/mixins'
import { Draggable, Container } from 'vue-smooth-dnd'
import useSound from 'vue-use-sound'
import { Constants, Assets } from '@/services'

const { SlotMode, BlockTypes } = Constants;

export default {
    
    name: 'BlockSlot',
    components: { Block, Draggable, Container },
    mixins: [Animatable],

    props: {
        mode: { default: SlotMode.Slot },
        disabled: { default: false, },
        // Using an foot type code (a short string) is preferable to using an enum type here.
        // A string is more easily mapped to/from JSON data, which makes querying the server easier.
        // Also, I desperately wish I could use null to represent no content, but Mongoengine hates
        // lists with null values, so it's much easier to use the empty string. Alas.
        holding: { default: '' },
    },

    data() {
        return {
            dragActive: false,
            dropActive: false,
        }
    },

    setup() {
        // Load sounds
        const [ blockDrop ] = useSound(Assets.getSound('blockdrop'));
        return { sounds: { blockDrop } };
    },

    methods: {

        shouldAcceptDrop(srcOptions, payload) {
            // Don't accept drops if disabled
            if (this.disabled) return false;
            // If the slot if locked, only accept drops from ourself
            if (payload.source.mode === SlotMode.Locked) {
                return this === payload.source;
            }
            if (this.mode === SlotMode.Slot) return true;
            return false;
        },

        onDragStart(dragResult) {
            if (dragResult.isSource) {
                this.dragActive = true;
                this.$emit('move');
            }
        },

        onDragEnd(dragResult) {
            if (dragResult.isSource) {
                this.dragActive = false;
            }
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
            else if (removedIndex !== null) {
                // Only clear slot if we are in "slot" mode
                if (this.mode === SlotMode.Slot) this.$emit('update:holding', '');
            }
            else {
                this.$emit('accept', payload.source.holding);
                this.$emit('update:holding', payload.source.holding);
                // Play sound
                this.sounds.blockDrop();
            }
            // If we are the container being dropped into
            if (addedIndex != null) {
                this.dropActive = false;
            }
        },

        getPayload() {
            return { source: this }
        },

    },

    computed: {
        classes() {
            let classes = ['game-slot', `is-mode-${this.mode.name}`];
            if (this.dropActive) classes.push('drop-active');
            if (this.dragActive) classes.push('drag-active');
            if (this.holding) classes.push(`is-holding-${BlockTypes.forCode(this.holding).name}`);
            if (this.disabled) classes.push('is-disabled');
            return classes;
        },
        removeOnDrop() {
            if (this.mode === SlotMode.Locked) return false;
            // Can add behavior for other modes here
            return true;
        },
    }

}
</script>