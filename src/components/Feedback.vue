<template>
    <!-- Outer div to support transforms -->
    <div v-if="showing">
        <div
            :class="classes"
            @animationend="onAnimationEnd">
            {{ display }}
        </div>
    </div>
</template>

<script>
import { Constants, TranslationService } from '@/services'
const { FeedbackType } = Constants;

const KEY_LOOKUP = new Map([
    [FeedbackType.Perfect, 'perfect'],
    [FeedbackType.Great, 'great'],
    [FeedbackType.Good, 'good'],
    [FeedbackType.Okay, 'okay'],
    [FeedbackType.Incorrect, 'incorrect'],
]);
const CLASS_LOOKUP = KEY_LOOKUP;

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
        },
        display() {
            // Construct translation key using feedback type and lookup string
            const key = `play.feedback.${KEY_LOOKUP.get(this.showing)}`;
            return TranslationService.get(key);
        },
    }
}
</script>