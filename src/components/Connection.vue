<template>
    <div v-if="connection" class="connection">
        <div v-if="connection.edges.length === 0" class="placeholder">
            <slot name="placeholder"/>
        </div>
        <div v-else class="grouping">
            <component
                v-for="edge in connection.edges"
                :is="component"
                :[prop]="edge.node"
                :key="edge.node.id"/>
        </div>
    </div>
</template>

<script>
/**
 * Renders a GraphQL 'connection,' which is a list (queried from the server) that can be paginated.
 */
export default {
    name: 'Connection',
    props: {
        query: { required: true },
        field: String,
        component: { required: true },
        prop: String,
    },
    apollo: {
        connection: {
            query() { return this.query; },
            update(data) {
                if (this.field) return data[this.field]
            },
            fetchPolicy: 'cache-and-network',
        }
    }
}
</script>