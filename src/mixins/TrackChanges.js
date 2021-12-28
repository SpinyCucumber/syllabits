function calculateChanges(data, original) {
    console.log({data, original});
    // Handle objects
    // I can't comprehend why null is an object
    if (typeof original === 'object' && original !== null) {
        // For every key, calculate the changes of the corresponding value
        // We add a 'field' property to the changes of each key
        let changes = [];
        for (const key in original) {
            changes.push(...calculateChanges(data[key], original[key])
                .map((change) => {
                    change.field = (change.field) ? (change.field + '.' + key) : key;
                }));
        }
        return changes;
    }
    else {
        return [{ op: 'set', value: data }];
    }
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