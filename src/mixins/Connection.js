/**
 * Mixin that makes dealing with GraphQL connections a bit easier
 */
export default function(name, queryOptions) {
    const connName = name + 'Connection';
    return {
        apollo: {
            [connName]: queryOptions
        },
        computed: {
            [name]: function() {
                return this[connName]?.edges.map(edge => edge.node);
            }
        }
        // TODO Fetch more
    }
}