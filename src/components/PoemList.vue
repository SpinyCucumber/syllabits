<template>
    <div v-if="poems" class="poem-list">
        <div
            v-for="poemEdge in poems.edges"
            :key="poemEdge.node.id"
            @click="$router.push({name: 'Play', params: {poemID: poemEdge.node.id}})"
            class="entry">
            <div class="entry-content">
                <p class="title">{{ poemEdge.node.title }}</p>
                <p class="subtitle">{{ poemEdge.node.author }}</p>
            </div>
            <game-progress
                type="is-primary is-small"
                :value="poemEdge.node.progress.numCorrect"
                :max-value="poemEdge.node.numLines"/>
        </div>
    </div>
</template>

<script>
import GameProgress from './GameProgress'

export default {
    name: 'PoemList',
    components: { GameProgress },
    props: {
        query: { required: true },
    },
    apollo: {
        poems: {
            query() {
                return this.query;
            },
            fetchPolicy: 'cache-and-network'
        }
    },
}
</script>