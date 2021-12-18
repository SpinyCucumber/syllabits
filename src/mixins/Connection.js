export default function(name, queryOptions) {
    return {
        apollo: {
            [name]: queryOptions
        }
    }
}