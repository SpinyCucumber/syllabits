<template>
    <div
        v-if="showing"
        :class="classes"
        @animationend="onAnimationEnd">
        TEST
    </div>
</template>

<script>
import { Constants } from '@/services'
const { FeedbackType } = Constants;

const CLASS_LOOKUP = new Map([
    [FeedbackType.Perfect, 'perfect'],
    [FeedbackType.Great, 'great'],
    [FeedbackType.Good, 'good'],
    [FeedbackType.Okay, 'okay'],
])

export default 
{
    name: 'Feedback',

    data() {
        return {
            showing: null,
        }
    },

    methods: {
        show(feedbackType) {
            this.showing = feedbackType;
        },
        onAnimationEnd() {
            this.showing = null;
        },
    },

    computed: {
        classes() {
            let classes = ['game-feedback'];
            if (this.showing) classes.push(CLASS_LOOKUP.get(this.showing));
            return classes;
        }
    }
}
</script>