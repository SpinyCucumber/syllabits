<template>
    <div class="poem-list">
        <div
            v-for="poemEdge in poems.edges"
            :key="poemEdge.node.id"
            :label="poemEdge.node.title">
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
            }
        }
    }
}
</script>