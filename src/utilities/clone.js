/**
 * Clones objects while preserving metadata
 * Can optionally 'sanitize' data to omit metadata
 */
 export default function clone(value, options = {metaFields: new Set(), sanitize: false}) {
     // Check for null values first
    if (value === null) return value;

    const { metaFields, sanitize } = options;
    let result;
    // Don't deep clone wrapper objects.
    // We detect wrapper objects by converting to value before checking type.
    if (typeof value.valueOf() !== 'object') {
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
    if (!sanitize) {
        for (const field of metaFields) {
            if (value[field]) result[field] = value[field];
        }
    }
    return result;

}