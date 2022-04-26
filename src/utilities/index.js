import ObjectID from 'bson-objectid'

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
 * Models a block type
 * Each block type has a String value to identify it,
 * and a stress pattern defined by a sequence of StressTypes
 */
class BlockType extends String {

    constructor(value, stresses) {
        super(value);
        this.stresses = stresses;
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

/**
 * Finds differences between a submitted answer and a key
 * Assumes the answer and the key are the same length
 * Returns a list of indicies of differences
 */
function findConflicts(key, answer) {
    let conflicts = [];
    for (let i = 0; i < key.length; i++) {
        if (key[i] !== answer[i]) {
            conflicts.push(i);
        }
    }
    return conflicts;
}

/**
 * Compares a submitted line answer to an answer key, returning an object
 * The returned object contains a 'correct' property. If correct is false,
 * it optionally contains a 'conflicts' property which contains the indicies of conflicting feet.
 */
function checkLine(key, answer) {
    if (key.length !== answer.length) return { correct: false };
    let conflicts = findConflicts(key, answer);
    return { correct: (conflicts.length === 0), conflicts };
}

/**
 * Creates an empty gameboard line
 */
 function makeLine() {
    return {
        id: ObjectID().toHexString(),
        text: '',
        key: new Array(5).fill(''),
        stanzaBreak: false,
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function timeout(fn, ms, ...args) {
    await sleep(ms);
    return fn(...args);
}

export { default as clone } from './clone'
export { PoemLocation, BlockType, Enum, toTranslationKey, findConflicts, checkLine, makeLine, sleep, timeout };