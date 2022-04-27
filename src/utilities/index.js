/**
 * Handles encoding/decoding poem locations
 * Poem locations are BSON-encoded strings that identify a poem in a context
 * I.e. can be a "direct location" or identify a poem using a collection and an index
 */
class PoemLocation {

    constructor(fields) {
        Object.assign(this, fields);
    }

    encode() {
        const json = JSON.stringify(this);
        return Buffer.from(json).toString("base64");
    }
    
}

/**
 * Constructed using an object where the keys are the name of the member,
 * and the values are the args used to initialize the member value.
 */
 class Enum {

    constructor(values, initializer = (x => new Object(x))) {
        // We maintain an array to allow users to iterate over all members
        this._values = {};

        for (const [key, value] of Object.entries(values)) {

            let obj = initializer(value);
            Object.defineProperty(obj, 'name', {
                value: key,
                writable: false,
            });
            this[key] = obj;
            this._values[obj] = obj;

        }
    }

    get values() {
        return Object.values(this._values);
    }

    fromValue(value) {
        return this._values[value];
    }

}

/**
 * Converts an enum-like name to a lowercase translation key
 */
function toTranslationKey(name) {
    return name.replace(/_|-/g, '').toLowerCase();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function timeout(fn, ms, ...args) {
    await sleep(ms);
    return fn(...args);
}

export { default as clone } from './clone'
export { PoemLocation, Enum, toTranslationKey, sleep, timeout };