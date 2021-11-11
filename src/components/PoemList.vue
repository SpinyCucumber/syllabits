<template>
    <div v-if="poems" class="poem-list">
        <div
            v-for="poemEdge in poems.edges"
            :key="poemEdge.node.id" class="entry">
            <div class="entry-content">
                <p class="title">{{ poemEdge.node.title }}</p>
                <p class="subtitle">{{ poemEdge.node.author }}</p>
            </div>
            <div class="entry-banner"/>
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