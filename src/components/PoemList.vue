<template>
    <div v-if="poems" class="poem-list">
        <div
            v-for="poemEdge in poems.edges"
            :key="poemEdge.node.id"
            class="entry">
            <span>{{ poemEdge.node.title }}</span>
            <span>{{ poemEdge.node.author }}</span>
            <span>{{ Number(poemEdge.node.progress.completion).toLocaleString(undefined, {style: 'percent'}) }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PoemList',
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