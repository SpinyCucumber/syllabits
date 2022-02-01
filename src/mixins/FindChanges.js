import deepEqual from 'deep-equal'

const internalFields = new Set(['id', '_hint']);

class Context {
    constructor(path, options) {
        this.path = path;
        this.options = options;
    }
    fork() {
        return new Context(this.path, this.options);
    }
    makeTransform(op, args) {
        return {path: this.path, op, ...args};
    }
}

function inferHandler(value, fallback) {
    let hint = value._hint;
    if (hint) {
        let handler = handlers[hint];
        if (handler) return handler;
    }
    return fallback;
}

/**
 * Omits internal fields from objects so that only "data" is left
 */
function sanitize(value) {
    if (typeof value !== 'object' || value === null) return value;
    return Object.keys(value)
        .filter((key) => !internalFields.has(key))
        .reduce((result, key) => {
            result[key] = sanitize(value[key]);
            return result;
        }, {});
}


const handlers = {

    /**
    * Documents don't support adding/removing fields, so our job is a bit easier
    */
    Document: function*(newValue, oldValue, context) {
        for (const fieldName in oldValue) {
            // Allow user to exclude certain fields
            if (context.options.excludeFields.has(fieldName) || internalFields.has(fieldName)) continue;
            // If field defines hint property, lookup and call appropriate handler
            const newFieldValue = newValue[fieldName], oldFieldValue = oldValue[fieldName];
            let handler = inferHandler(oldFieldValue);
            if (handler) {
                let fieldContext = context.fork();
                if (fieldContext.path !== '') fieldContext.path += '.';
                fieldContext.path += fieldName;
                yield* handler(newFieldValue, oldFieldValue, fieldContext);
            }
            // If the field is an atomic type (e.g. String, Number) or explicitly marked as atomic,
            // we check for equality between the old and new value. If they are different,
            // we produce a 'set' change
            else if (typeof oldFieldValue !== 'object' || oldFieldValue._atomic) {
                if (!deepEqual(newFieldValue, oldFieldValue, {strict: true}))
                    yield context.makeTransform('set', {field: fieldName, value: newFieldValue});
            }
        }
    },

    List: function*(newValue, oldValue, context) {
        // Determine new elements and removed elements
        let removed = new Set(oldValue);
        let added = new Set();
        for (const elem of newValue) {
            if (removed.has(elem)) removed.delete(elem);
            else added.add(elem);
        }
        for (const value of removed) yield context.makeTransform('remove', {value})
        for (const value of added) yield context.makeTransform('add', {value});
    },

    /**
    * All documents in a document list must declare a field 'id'
    */
    DocumentList: function*(newValue, oldValue, context) {
        // A lookup table to speed up finding documents by ID
        const lookup = new Map(oldValue.map(document => ([document.id, document])));
        for (const newDocument of newValue) {
            // Check if document is new or deleted
            if (newDocument._new) {
                yield context.makeTransform('create', {data: sanitize(newDocument)});
            }
            else if (newDocument._deleted) {
                yield context.makeTransform('delete', {where: {id: newDocument.id}});
            }
            else {
                // Find document with corresponding ID and construct document path
                let oldDocument = lookup.get(newDocument.id);
                let documentContext = context.fork();
                documentContext.path += `[id=${newDocument.id}]`;
                let handler = inferHandler(oldDocument, handlers.Document);
                yield* handler(newDocument, oldDocument, documentContext);
            }
        }
    },

};

/**
 * A Vue mixin that tracks how a prop changes over time
 * Creates a computed property 'transforms'
 */
export default function TrackChanges(args) {
    // Extract prop, original option
    const { oldValue, newValue, ...options } = args;
    // Coerce excludeFields into a set
    options.excludeFields = new Set(options.excludeFields);
    return ({
        computed: {
            transforms() {
                let context = new Context('', options);
                let handler = inferHandler(this[oldValue], handlers.Document);
                return Array.from(handler(this[newValue], this[oldValue], context));
            },
        }
    });
}