<template>
    <div class="poem-list">
        TODO
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