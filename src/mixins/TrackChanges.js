function calculateChanges(data, original) {
    
}

/**
 * A Vue mixin that tracks how a prop changes over time
 * Requires the name of the prop to track, and the name of prop that contains the "original" copy
 * Creates a computed property which is a list of changes named 'changes'
 */
export default function TrackChanges(dataName, originalName) {
    return ({
        computed: {
            changes() {
                return calculateChanges(this[dataName], this[originalName]);
            }
        }
    });
}