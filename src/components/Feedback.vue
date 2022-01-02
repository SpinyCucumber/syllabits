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
import { TranslationService } from '@/services'

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
            if (this.showing) classes.push(`is-type-${this.showing.name}`);
            return classes;
        },
        display() {
            // Construct translation key using feedback type name
            const key = `play.feedback.${this.showing.name}`;
            return TranslationService.get(key);
        },
    }
}
</script>