function handlerForHint(hint) {
    // TODO
}

/**
 * TODO
 * Documents don't support adding/removing fields
 */
function handleDocument(newDoc, oldDoc) {
    let changes = []
    for (const prop in original) {
        // If field is object, try to determine handler
        const newField = newDoc[prop], oldField = oldDoc[prop];
        if (typeof field === 'object' && field._trackerHint) {
            let handler = handlerForHint(field._trackerHint);
            let fieldChanges = handler(newField, oldField);
            // Modify the path of each change and combine
            // TODO
        }
    }
}

function calculateChanges(data, original, context) {
    const { excludeFields } = context;
    // Handle objects
    // I can't comprehend why null is an object
    if (typeof original === 'object' && original !== null) {
        // For every key, calculate the changes of the corresponding value
        // We add a 'field' property to the changes of each key
        let changes = [];
        for (const key in original) {
            // Allow the user the exclude certain fields
            if (excludeFields.has(key)) continue;
            let subchanges = calculateChanges(data[key], original[key], context);
            for(let change of subchanges) change.field = (change.field) ? (key + '.' + change.field) : key;
            changes.push(...subchanges);
        }
        return changes;
    }
    else if (original !== data) {
        return [{ op: 'set', value: data }];
    }
    return [];
}

/**
 * A Vue mixin that tracks how a prop changes over time
 * Requires the name of the prop to track, and the name of prop that contains the "original" copy
 * Creates a computed property which is a list of changes named 'changes'
 */
export default function TrackChanges(options) {
    // Extract prop, original option
    const { prop, original, ...context } = options;
    // Coerce excludeFields into a set
    context.excludeFields = new Set(context.excludeFields);
    return ({
        computed: {
            changes() {
                return calculateChanges(
                    this[prop],
                    this[original],
                    context
                );
            }
        }
    });
}