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
            type="is-primary is-small"
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
        poem: { required: true }
    }
}
</script>