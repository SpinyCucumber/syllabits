<template>
    <div v-if="connection" class="connection">
        <div v-if="connection.edges.length === 0" class="placeholder">
            <slot name="placeholder"/>
        </div>
        <transition-group v-else :tag="tag" name="list" class="connection-list">
            <component
                v-for="edge in connection.edges"
                :is="component"
                :[prop]="edge.node"
                :key="edge.node.id"/>
        </transition-group>
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
        map: Function,
        component: { required: true },
        prop: String,
        perPage: Number,
        tag: { default: 'div' }
    },
    apollo: {
        connection: {
            query() { return this.query; },
            variables() {
                return { first: this.perPage };
            },
            update(data) {
                if (this.map) return this.map(data);
            },
            fetchPolicy: 'cache-and-network',
        }
    }
}
</script>