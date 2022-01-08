let handlerLookup = new Map();

class Handler {
    constructor(options) {
        const { forHint, findChanges } = options;
        // We expose a 'change' argument to each handler, which is a function that helps
        // creating new changes by automatically setting the document path.
        this.findChanges = function *(args) {
            const { path } = args;
            function change(args) {
                return {path, ...args};
            }
            yield* findChanges({change, ...args});
        }
        // Register handler
        handlerLookup.set(forHint, this);
    }
}

function handlerForHint(hint) {
    return handlerLookup.get(hint);
}

/**
 * Documents don't support adding/removing fields
 */
const documentHandler = new Handler({
    forHint: 'Document',
    *findChanges({path, newValue, oldValue, change, context}) {
        for (const fieldName in oldValue) {
            // Allow user to exclude certain fields
            if (context.excludeFields.has(fieldName)) continue;
            // If field defines hint property, lookup and call appropriate handler
            const newFieldValue = newValue[fieldName], oldFieldValue = oldValue[fieldName];
            let hint = oldFieldValue._trackerHint;
            if (hint) {
                let handler = handlerForHint(hint);
                let fieldPath = path ? path + '.' + fieldName : fieldName;
                yield* handler.findChanges({path: fieldPath, newValue: newFieldValue, oldValue: oldFieldValue});
            }
            else if (newFieldValue !== oldFieldValue) {
                yield change({op: 'set', field: fieldName, value: newFieldValue});
            }
        }
    }
});

/**
 * A Vue mixin that tracks how a prop changes over time
 * Requires the name of the prop to track, and the name of prop that contains the "original" copy
 * Creates a computed property which is a list of changes named 'changes'
 */
export default function FindChanges(options) {
    // Extract prop, original option
    const { newProp, oldProp, ...context } = options;
    // Coerce excludeFields into a set
    context.excludeFields = new Set(context.excludeFields);
    return ({
        computed: {
            changes() {
                return Array.from(documentHandler.findChanges({
                    newValue: this[newProp],
                    oldValue: this[oldProp],
                    context,
                }));
            }
        }
    });
}