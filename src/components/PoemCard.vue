<template>
    <div
        class="poem-card"
        @click="$router.push({name: 'Play', params: {location: poem.location}})">
        <div class="poem-card-content">
            <p class="title">
                <span class="mdi mdi-text"/>
                {{ poem.title }}
            </p>
            <p class="subtitle">{{ poem.author }}</p>
        </div>
        <game-progress
            :class="progressClasses"
            :value="poem.progress.numCorrect"
            :max-value="poem.numLines"/>
    </div>
</template>

<script>
import GameProgress from './GameProgress'

export default {
    name: 'PoemCard',
    components: { GameProgress },
    props: {
        poem: { required: true },
        /**
         * Allows users to specify a 'variant,' which affects look/feel of poem card
         * Valid values are null, 'is-completed' or 'is-saved'
         */
        type: { default: null },
    },
    computed: {
        progressClasses() {
            return ['is-small', this.type === 'is-completed' ? 'is-success' : 'is-primary'];
        }
    },
}
</script>