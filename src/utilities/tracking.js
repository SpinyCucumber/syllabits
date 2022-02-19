import deepEqual from "deep-equal";

/**
 * A context comparing objects
 * Includes a 'path,' which refers to the part of the object being examined
 */
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

class Handler {

    constructor(options) {
        if (options) Object.assign(this, options);
    }

}

/**
 * Finds changes between two 'documents,' which are key/value containers.
 * Documents don't support adding/removing fields
 */
class Document extends Handler {

    constructor(fieldHandlers = {}, options) {
        super(options);
        this.fieldHandlers = fieldHandlers;
    }

    *findTransforms(newValue, oldValue, context) {
        for (const fieldName in oldValue) {
            // Allow user to exclude certain fields
            if (context.options.excludeFields.has(fieldName)) continue;
            const newFieldValue = newValue[fieldName], oldFieldValue = oldValue[fieldName];
            // If field handler IS specified, we create a new context and defer the tracking
            // logic to the field handler.
            // If field handler is not specified, we treat the field as an atomic value,
            // and we check for equality between the old and new value. If they are different,
            // we produce a 'set' change.
            const fieldHandler = this.fieldHandlers[fieldName];
            if (fieldHandler) {
                let fieldContext = context.fork();
                if (fieldContext.path !== '') fieldContext.path += '.';
                fieldContext.path += fieldName;
                yield* fieldHandler.findTransforms(newFieldValue, oldFieldValue, fieldContext);
            }
            else {
                if (!deepEqual(newFieldValue, oldFieldValue, {strict: true})) {
                    yield context.makeTransform('set', {field: fieldName, value: newFieldValue});
                }
            }
        }
    }

}

/**
 * Finds changes between two lists of atomic values
 */
class List extends Handler {

    *findTransforms(newValue, oldValue, context) {
        // Determine new elements and removed elements
        let removed = new Set(oldValue);
        let added = new Set();
        for (const elem of newValue) {
            if (removed.has(elem)) removed.delete(elem);
            else added.add(elem);
        }
        for (const value of removed) yield context.makeTransform('remove', {value});
        for (const value of added) yield context.makeTransform('add', {value});
    }

}

/**
 * Finds changes between two 'documents lists,' which are lists of composite values.
 * Unlike a reference lists, the documents are actually embedded.
 * Must specify an 'idField' which determines which property uniquely identifies documents
 */
class DocumentList extends Handler {

    constructor(elemHandler, options) {
        super(options);
        this.elemHandler = elemHandler;
    }

    *findTransforms(newValue, oldValue, context) {
        // A lookup table to speed up finding documents by ID
        const removed = new Map(oldValue.map(document => ([document[this.idField], document])));
        for (const newDocument of newValue) {
            const id = newDocument[this.idField];
            // If document exists in both old and new lists, find transforms of document
            if (removed.has(id)) {
                // Find document with corresponding ID and construct document path
                let oldDocument = removed.get(id);
                removed.delete(id);
                let documentContext = context.fork();
                documentContext.path += `[${this.idField}=${id}]`;
                yield* this.elemHandler.findTransforms(newDocument, oldDocument, documentContext);
            }
            // Otherwise, document is new. We produce a 'create' transform
            else {
                yield context.makeTransform('create', {data: newDocument});
            }
        }
        // All documents that exist in the old list but not the new have been deleted.
        // For each one, produce a 'delete' transform
        for (const id of removed.keys()) {
            yield context.makeTransform('delete', {where: {[this.idField]: id}});
        }
    }

}

export { Context, Handler, Document, List, DocumentList }