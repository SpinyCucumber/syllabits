import deepEqual from 'deep-equal'

const metaFields = new Set(['id', '_hint', '_atomic']);

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

/**
 * Determines which handler to use when comparing objects
 * Makes a 'best guess' based on the object's type.
 * Objects can optionally override the default by specifying a 'hint'
 * property, which should be a string that corresponds to the handler name.
 */
function inferHandler(value) {
    // Attempt to use hint to determine handler
    let hint = value._hint;
    if (hint) {
        let handler = handlers[hint];
        if (handler) return handler;
    }
    // 'Guess' handler using value type
    if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) return handlers.List;
        else return handlers.Document;
    }
}

/**
 * Clones objects while preserving metadata like hints
 * Can optionally 'sanitize' data to omit metadata
 */
function clone(value, options = {sanitize: false}) {
    if (value === null) return value;

    let result;
    if (typeof value !== 'object') {
        result = value;
    }
    else if (Array.isArray(value)) {
        result = value.map(e => clone(e, options));
    }
    else {
        result = {};
        for(const key in value) {
            if (metaFields.has(key)) continue;
            result[key] = clone(value[key], options);
        }
    }
    // Copy meta fields
    if (!options.sanitize) {
        for (const field of metaFields) {
            if (value[field]) result[field] = value[field];
        }
    }
    return result;

}

const handlers = {

    /**
     * Finds changes between two 'documents,' which are key/value containers.
     * Documents don't support adding/removing fields
     */
    Document: function*(newValue, oldValue, context) {
        for (const fieldName in oldValue) {
            // Allow user to exclude certain fields
            if (context.options.excludeFields.has(fieldName) || metaFields.has(fieldName)) continue;
            // If field defines hint property, lookup and call appropriate handler
            const newFieldValue = newValue[fieldName], oldFieldValue = oldValue[fieldName];
            // If the field is an atomic type (e.g. String, Number) or explicitly marked as atomic,
            // we check for equality between the old and new value. If they are different,
            // we produce a 'set' change
            // Otherwise, we infer the handler for the field value
            if (typeof oldFieldValue !== 'object' || oldFieldValue._atomic) {
                if (!deepEqual(newFieldValue, oldFieldValue, {strict: true}))
                    yield context.makeTransform('set', {field: fieldName, value: newFieldValue});
            }
            else {
                let handler = inferHandler(oldFieldValue);
                let fieldContext = context.fork();
                if (fieldContext.path !== '') fieldContext.path += '.';
                fieldContext.path += fieldName;
                yield* handler(newFieldValue, oldFieldValue, fieldContext);
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
     * Finds changes between two 'documents lists,' which are lists of composite values.
     * All documents in a document list must declare a field 'id'
     */
    DocumentList: function*(newValue, oldValue, context) {
        // A lookup table to speed up finding documents by ID
        const lookup = new Map(oldValue.map(document => ([document.id, document])));
        for (const newDocument of newValue) {
            // Check if document is new or deleted
            if (newDocument._new) {
                let data = clone(newDocument, {sanitize: true});
                yield context.makeTransform('create', {data});
            }
            else if (newDocument._deleted) {
                yield context.makeTransform('delete', {where: {id: newDocument.id}});
            }
            else {
                // Find document with corresponding ID and construct document path
                let oldDocument = lookup.get(newDocument.id);
                let documentContext = context.fork();
                documentContext.path += `[id=${newDocument.id}]`;
                let handler = inferHandler(oldDocument);
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
    // Extract prop to track and options
    const { toTrack, ...options } = args;
    // Coerce excludeFields into a set
    options.excludeFields = new Set(options.excludeFields);
    return ({
        data() {
            return {
                original: null,
            }
        },
        computed: {
            transforms() {
                let context = new Context('', options);
                let handler = inferHandler(this.original);
                return Array.from(handler(this[toTrack], this.original, context));
            },
        },
        methods: {
            startTracking() {
                this.original = this[toTrack];
                this[toTrack] = clone(this[toTrack]);
            }
        }
    });
}