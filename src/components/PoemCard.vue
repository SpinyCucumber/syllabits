<template>
    <div
        class="poem-card"
        @click="play">
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
import GameProgress from './gameboard/GameProgress'
import { PoemLocation } from '@/utilities'
import { Constants } from '@/services'

const { LocationType } = Constants

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
    methods: {
        play() {
            // If we know the location most recently used to access a poem, use that location.
            // Otherwise, use a direct poem location.
            const location = this.poem.location || new PoemLocation({t: LocationType.DIRECT, p: this.poem.id}).encode();
            this.$router.push({name: 'Gameboard', query: { location }});
        }
    },
    computed: {
        progressClasses() {
            return ['is-small', this.type === 'is-completed' ? 'is-success' : 'is-primary'];
        }
    },
}
</script>